<?php

declare(strict_types=1);

namespace TradeUnion\Api\Services;

use PDO;

final class AuditService
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function log(?int $userId, string $action, string $entityType, ?int $entityId, array $metadata = [], ?string $ip = null): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $action, $entityType, $entityId, json_encode($metadata, JSON_UNESCAPED_UNICODE), $ip]);
    }
}
