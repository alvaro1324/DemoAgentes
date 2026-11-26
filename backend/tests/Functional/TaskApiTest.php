<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\Category;
use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class TaskApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $em = static::getContainer()->get(EntityManagerInterface::class);
        self::assertInstanceOf(EntityManagerInterface::class, $em);
        $path = $em->getConnection()->getParams()['path'] ?? '';
        self::assertStringEndsWith('tasks_test.db', $path, 'La limpieza solo se permite en la base de pruebas.');
        $schema = new SchemaTool($em);
        $metadata = [$em->getClassMetadata(Category::class), $em->getClassMetadata(Task::class)];
        $schema->dropSchema($metadata);
        $schema->createSchema($metadata);
    }

    public function testCompleteLifecycleAndPersistence(): void
    {
        $this->client->request('GET', '/api/tasks');
        self::assertResponseIsSuccessful();
        self::assertSame([], $this->body());
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => '  Preparar demo  ', 'description' => 'Con pruebas']);
        self::assertResponseStatusCodeSame(201);
        $task = $this->body();
        self::assertSame('Preparar demo', $task['title']);
        self::assertFalse($task['isCompleted']);
        self::assertMatchesRegularExpression('/\+00:00$/', $task['createdAt']);
        $url = '/api/tasks/'.$task['id'];
        self::assertResponseHeaderSame('Location', $url);

        // Cada petición reinicia el kernel: estos datos deben haberse persistido.
        $this->client->request('GET', $url);
        self::assertSame($task, $this->body());
        $this->client->jsonRequest('PATCH', $url, ['title' => 'Demo lista']);
        self::assertResponseStatusCodeSame(200);
        self::assertSame('Con pruebas', $this->body()['description']);
        self::assertSame($task['createdAt'], $this->body()['createdAt']);
        $this->client->jsonRequest('PATCH', $url, ['isCompleted' => true, 'description' => null]);
        self::assertTrue($this->body()['isCompleted']);
        self::assertNull($this->body()['description']);
        $this->client->request('GET', '/api/tasks?completed=false');
        self::assertSame([], $this->body());
        $this->client->request('GET', '/api/tasks?completed=true');
        self::assertCount(1, $this->body());
        $this->client->jsonRequest('PATCH', $url, ['isCompleted' => false]);
        self::assertFalse($this->body()['isCompleted']);
        $this->client->request('DELETE', $url);
        self::assertResponseStatusCodeSame(204);
        self::assertSame('', $this->client->getResponse()->getContent());
        $this->client->request('GET', $url);
        self::assertResponseStatusCodeSame(404);
        self::assertSame('not_found', $this->body()['code']);
    }

    /** @return iterable<string, array{array<string, mixed>}> */
    public static function invalidCreatePayloads(): iterable
    {
        yield 'missing title' => [[]];
        yield 'blank title' => [['title' => '   ']];
        yield 'unicode whitespace' => [['title' => "\u{00A0}\u{2003}"]];
        yield 'title too long' => [['title' => str_repeat('a', 201)]];
        yield 'non string title' => [['title' => 123]];
        yield 'null title' => [['title' => null]];
        yield 'description too long' => [['title' => 'Ok', 'description' => str_repeat('a', 5001)]];
        yield 'non string description' => [['title' => 'Ok', 'description' => false]];
        yield 'read only id' => [['title' => 'Ok', 'id' => 5]];
        yield 'state on creation' => [['title' => 'Ok', 'isCompleted' => true]];
    }

    #[DataProvider('invalidCreatePayloads')]
    public function testRejectsInvalidCreationWithoutWriting(array $payload): void
    {
        $this->client->jsonRequest('POST', '/api/tasks', $payload);
        self::assertResponseStatusCodeSame(400);
        self::assertSame('validation_error', $this->body()['code']);
        $this->client->request('GET', '/api/tasks');
        self::assertSame([], $this->body());
    }

    public function testInvalidUpdateIsAtomic(): void
    {
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => 'Conservar']);
        $url = '/api/tasks/'.$this->body()['id'];
        $this->client->jsonRequest('PATCH', $url, ['title' => 'No guardar', 'isCompleted' => 'false']);
        self::assertResponseStatusCodeSame(400);
        $this->client->request('GET', $url);
        self::assertSame('Conservar', $this->body()['title']);
        self::assertFalse($this->body()['isCompleted']);
        $this->client->request('PATCH', $url, server: ['CONTENT_TYPE' => 'application/json'], content: '{}');
        self::assertResponseStatusCodeSame(400);
    }

    /** @return iterable<string, array{string}> */
    public static function malformedBodies(): iterable
    {
        yield 'broken json' => ['{'];
        yield 'array root' => ['[]'];
        yield 'null root' => ['null'];
        yield 'scalar root' => ['"hello"'];
    }

    #[DataProvider('malformedBodies')]
    public function testRejectsMalformedBody(string $body): void
    {
        $this->client->request('POST', '/api/tasks', server: ['CONTENT_TYPE' => 'application/json'], content: $body);
        self::assertResponseStatusCodeSame(400);
        self::assertArrayHasKey('errors', $this->body());
    }

    public function testFiltersAndOrdering(): void
    {
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => 'Primera']);
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => 'Segunda']);
        $id = $this->body()['id'];
        $this->client->jsonRequest('PATCH', '/api/tasks/'.$id, ['isCompleted' => true]);
        $this->client->request('GET', '/api/tasks');
        self::assertSame(['Segunda', 'Primera'], array_column($this->body(), 'title'));
        $this->client->request('GET', '/api/tasks?completed=false');
        self::assertSame(['Primera'], array_column($this->body(), 'title'));
        $this->client->request('GET', '/api/tasks?completed=yes');
        self::assertResponseStatusCodeSame(400);
        $this->client->request('GET', '/api/tasks?completed[]=true');
        self::assertResponseStatusCodeSame(400);
    }

    public function testMissingResourcesAndUnsupportedRequests(): void
    {
        foreach (['GET', 'PATCH', 'DELETE'] as $method) {
            $this->client->jsonRequest($method, '/api/tasks/99999', ['title' => 'Nada']);
            self::assertResponseStatusCodeSame(404);
            self::assertSame('not_found', $this->body()['code']);
        }
        $this->client->request('POST', '/api/tasks', content: 'title=Texto');
        self::assertResponseStatusCodeSame(415);
        $this->client->request('PUT', '/api/tasks/1');
        self::assertResponseStatusCodeSame(405);
        self::assertResponseHasHeader('Allow');
    }

    /** @return array<mixed> */
    private function body(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
    }
}
