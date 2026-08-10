<?php

declare(strict_types=1);

namespace TradeUnion\Api\Controllers;

use RuntimeException;
use TradeUnion\Api\Http\Request;
use TradeUnion\Api\Http\Response;
use TradeUnion\Api\Services\AuthService;

final class AuthController
{
    public function __construct(private readonly AuthService $auth)
    {
    }

    public function login(Request $request): array
    {
        try {
            return ['session' => $this->auth->login(
                (string) ($request->input('login') ?? $request->input('email')),
                (string) $request->input('password'),
                $request->ip,
                $request->header('user-agent') ?? ''
            )];
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 401);
        }
    }

    public function register(Request $request): array
    {
        try {
            return ['session' => $this->auth->register(
                (string) $request->input('invite_code'),
                (string) ($request->input('login') ?? $request->input('email')),
                (string) $request->input('name'),
                (string) $request->input('password'),
                $request->ip,
                $request->header('user-agent') ?? ''
            )];
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function logout(Request $request): array
    {
        $this->auth->logout($request->attributes['session_token']);
        return ['message' => 'Logged out'];
    }

    public function csrf(Request $request): array
    {
        return ['csrf_token' => $this->auth->csrf($request->attributes['session_token'])];
    }

    public function me(Request $request): array
    {
        return ['user' => $request->attributes['user']];
    }
}
