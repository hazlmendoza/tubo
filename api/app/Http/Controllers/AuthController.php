<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new business and its owner.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $company = Company::create([
                'name' => $validated['company_name'],
            ]);

            return $company->users()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'owner',
            ]);
        });

        // Create the Laravel session.
        Auth::guard('web')->login($user);

        // Prevent session fixation.
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $user->load('company'),
        ], 201);
    }

    /**
     * Login using Laravel's session-based authentication.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::guard('web')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Prevent session fixation.
        $request->session()->regenerate();

        $user = $request->user()->load('company');

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('company'),
        ]);
    }

    /**
     * Logout and destroy the authenticated session.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }
}
