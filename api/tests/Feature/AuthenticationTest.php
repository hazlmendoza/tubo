<?php

namespace Tests\Feature;

use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_a_business_account(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/register',
        ])->postJson('/api/auth/register', [
            'company_name' => 'Acme Services',
            'name' => 'Ari Santos',
            'email' => 'ari@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.name', 'Ari Santos')
            ->assertJsonPath('user.company.name', 'Acme Services');

        $this->assertDatabaseHas('companies', [
            'name' => 'Acme Services',
            'tax_id' => null,
        ]);
        $this->assertDatabaseHas('users', [
            'name' => 'Ari Santos',
            'email' => 'ari@example.com',
        ]);
    }

    public function test_authenticated_user_can_read_profile_and_log_out(): void
    {
        $company = Company::create(['name' => 'Acme Services']);
        $user = $company->users()->create([
            'name' => 'Ari Santos',
            'email' => 'ari@example.com',
            'password' => 'password123',
        ]);

        $this->actingAs($user, 'web')
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('user.email', 'ari@example.com')
            ->assertJsonPath('user.company.name', 'Acme Services');

        $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/dashboard',
        ])->actingAs($user, 'web')
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logout successful.');
    }

    public function test_user_can_log_in_with_valid_credentials(): void
    {
        $company = Company::create(['name' => 'Acme Services']);
        $company->users()->create([
            'name' => 'Ari Santos',
            'email' => 'ari@example.com',
            'password' => 'password123',
        ]);

        $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/login',
        ])->postJson('/api/auth/login', [
            'email' => 'ari@example.com',
            'password' => 'password123',
        ])
            ->assertOk()
            ->assertJsonPath('user.email', 'ari@example.com')
            ->assertJsonPath('user.company.name', 'Acme Services');
    }
}