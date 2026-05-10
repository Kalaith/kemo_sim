<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    private const STATS = ['strength', 'agility', 'intelligence', 'charisma', 'endurance', 'loyalty'];
    private const STARTING_COINS = 1000;
    private const STARTING_DAY = 1;
    private const BREEDING_COST = 200;
    private const BREEDING_DURATION_DAYS = 3;
    private const SAVE_VERSION = 1;

    private const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Silver', 'White', 'Blue', 'Purple', 'Pink', 'Green'];
    private const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Purple', 'Gold', 'Red', 'Silver'];
    private const PERSONALITIES = ['Playful', 'Serious', 'Shy', 'Outgoing', 'Calm', 'Energetic', 'Mischievous', 'Gentle', 'Bold', 'Wise'];

    private const TYPES = [
        [
            'name' => 'Nekomimi',
            'animal' => 'Cat',
            'traits' => ['Curious', 'Agile', 'Independent'],
            'jobBonuses' => ['stealth' => 20, 'entertainment' => 15, 'athletic' => 10],
            'baseStats' => ['strength' => 40, 'agility' => 70, 'intelligence' => 60, 'charisma' => 55, 'endurance' => 50, 'loyalty' => 45],
        ],
        [
            'name' => 'Inumimi',
            'animal' => 'Dog',
            'traits' => ['Loyal', 'Brave', 'Friendly'],
            'jobBonuses' => ['security' => 25, 'athletic' => 15, 'entertainment' => 10],
            'baseStats' => ['strength' => 65, 'agility' => 60, 'intelligence' => 55, 'charisma' => 70, 'endurance' => 70, 'loyalty' => 85],
        ],
        [
            'name' => 'Kitsunemimi',
            'animal' => 'Fox',
            'traits' => ['Cunning', 'Intelligent', 'Mysterious'],
            'jobBonuses' => ['magical' => 30, 'scholarly' => 25, 'stealth' => 15],
            'baseStats' => ['strength' => 45, 'agility' => 65, 'intelligence' => 85, 'charisma' => 60, 'endurance' => 55, 'loyalty' => 40],
        ],
        [
            'name' => 'Usagimimi',
            'animal' => 'Rabbit',
            'traits' => ['Quick', 'Cautious', 'Gentle'],
            'jobBonuses' => ['athletic' => 20, 'stealth' => 10, 'entertainment' => 15],
            'baseStats' => ['strength' => 35, 'agility' => 80, 'intelligence' => 65, 'charisma' => 50, 'endurance' => 60, 'loyalty' => 60],
        ],
        [
            'name' => 'Ookami',
            'animal' => 'Wolf',
            'traits' => ['Strong', 'Pack-oriented', 'Leadership'],
            'jobBonuses' => ['security' => 20, 'physical' => 25, 'leadership' => 30],
            'baseStats' => ['strength' => 80, 'agility' => 70, 'intelligence' => 70, 'charisma' => 75, 'endurance' => 75, 'loyalty' => 70],
        ],
        [
            'name' => 'Nezumimi',
            'animal' => 'Mouse',
            'traits' => ['Small', 'Sneaky', 'Resourceful'],
            'jobBonuses' => ['stealth' => 25, 'scholarly' => 15, 'infiltration' => 30],
            'baseStats' => ['strength' => 25, 'agility' => 75, 'intelligence' => 70, 'charisma' => 40, 'endurance' => 45, 'loyalty' => 55],
        ],
    ];

    private const JOBS = [
        [
            'name' => 'Physical Labor',
            'description' => 'Construction, farming, mining work',
            'requiredStats' => ['strength', 'endurance'],
            'trainingCost' => 100,
            'trainingTime' => 3,
            'salaryMultiplier' => 1.5,
        ],
        [
            'name' => 'Athletic Performance',
            'description' => 'Sports, dancing, acrobatics',
            'requiredStats' => ['agility', 'endurance'],
            'trainingCost' => 150,
            'trainingTime' => 4,
            'salaryMultiplier' => 2.0,
        ],
        [
            'name' => 'Scholarly Work',
            'description' => 'Research, teaching, accounting',
            'requiredStats' => ['intelligence'],
            'trainingCost' => 200,
            'trainingTime' => 5,
            'salaryMultiplier' => 2.5,
        ],
        [
            'name' => 'Entertainment',
            'description' => 'Singing, acting, hosting',
            'requiredStats' => ['charisma', 'agility'],
            'trainingCost' => 175,
            'trainingTime' => 4,
            'salaryMultiplier' => 3.0,
        ],
        [
            'name' => 'Security Work',
            'description' => 'Bodyguard, police, military',
            'requiredStats' => ['strength', 'loyalty'],
            'trainingCost' => 125,
            'trainingTime' => 4,
            'salaryMultiplier' => 2.2,
        ],
        [
            'name' => 'Stealth Operations',
            'description' => 'Spy work, investigation',
            'requiredStats' => ['agility', 'intelligence'],
            'trainingCost' => 250,
            'trainingTime' => 6,
            'salaryMultiplier' => 3.5,
        ],
        [
            'name' => 'Magical Arts',
            'description' => 'Spellcasting, potion-making',
            'requiredStats' => ['intelligence', 'charisma'],
            'trainingCost' => 300,
            'trainingTime' => 7,
            'salaryMultiplier' => 4.0,
        ],
    ];

    private const ACHIEVEMENTS = [
        ['id' => 'first_kemonomimi', 'name' => 'First Friend', 'description' => 'Own your first kemonomimi', 'condition' => 'totalKemonomimi >= 1', 'icon' => '*'],
        ['id' => 'collector', 'name' => 'Collector', 'description' => 'Own 10 kemonomimi', 'condition' => 'totalKemonomimi >= 10', 'icon' => '*'],
        ['id' => 'breeder', 'name' => 'Breeder', 'description' => 'Successfully breed your first kemonomimi', 'condition' => 'totalBreedings >= 1', 'icon' => '*'],
        ['id' => 'trainer', 'name' => 'Trainer', 'description' => 'Train your first kemonomimi in a job', 'condition' => 'totalTrainings >= 1', 'icon' => '*'],
        ['id' => 'wealthy', 'name' => 'Wealthy', 'description' => 'Accumulate 10,000 coins', 'condition' => 'totalCoinsEarned >= 10000', 'icon' => '*'],
        ['id' => 'survivor', 'name' => 'Survivor', 'description' => 'Survive for 30 days', 'condition' => 'daysSurvived >= 30', 'icon' => '*'],
        ['id' => 'master_trainer', 'name' => 'Master Trainer', 'description' => 'Train kemonomimi 50 times', 'condition' => 'totalTrainings >= 50', 'icon' => '*'],
        ['id' => 'family_founder', 'name' => 'Family Founder', 'description' => 'Have 5 successful breedings', 'condition' => 'totalBreedings >= 5', 'icon' => '*'],
    ];

    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        $kemonomimi = $this->starterKemonomimi();
        $marketStock = $this->starterMarketStock();

        return $this->refreshAchievements([
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'saveVersion' => self::SAVE_VERSION,
            'saveDate' => gmdate('c'),
            'coins' => self::STARTING_COINS,
            'day' => self::STARTING_DAY,
            'kemonomimi' => $kemonomimi,
            'breedingQueue' => [],
            'trainingQueue' => [],
            'marketStock' => $marketStock,
            'achievements' => $this->achievementTemplates(),
            'totalCoinsEarned' => 0,
            'totalCoinsSpent' => 0,
            'totalBreedings' => 0,
            'totalTrainings' => 0,
            'nextId' => $this->computeNextId($kemonomimi, $marketStock),
            'selectedParent1' => null,
            'selectedParent2' => null,
            'hasSeenOnboarding' => false,
            'lastBackup' => null,
            'lastDayLogs' => ['Welcome to Kemo Sim!'],
            'lastAdvanceResult' => $this->emptyAdvanceResult(),
            'breedingPreview' => null,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ]);
    }

    public function applyIntent(array $currentState, string $intent, array $payload): array
    {
        $state = $this->normalizeState($currentState);

        switch ($intent) {
            case 'load':
            case 'save':
                break;

            case 'reset_game':
                return $this->initialState();

            case 'import_game':
                $importedState = $payload['state'] ?? null;
                if (!is_array($importedState)) {
                    throw new RuntimeException('Imported game state must be an object.');
                }
                $state = $this->normalizeState($importedState);
                $state['lastDayLogs'] = ['Save imported.'];
                break;

            case 'create_backup':
                $backup = $state;
                $backup['lastBackup'] = null;
                $backup['saveDate'] = gmdate('c');
                $state['lastBackup'] = json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                $state['lastDayLogs'] = ['Backup created.'];
                break;

            case 'restore_backup':
                if (!is_string($state['lastBackup']) || $state['lastBackup'] === '') {
                    throw new RuntimeException('No backup exists.');
                }
                $restored = json_decode($state['lastBackup'], true);
                if (!is_array($restored)) {
                    throw new RuntimeException('Backup data is invalid.');
                }
                $backupText = $state['lastBackup'];
                $state = $this->normalizeState($restored);
                $state['lastBackup'] = $backupText;
                $state['lastDayLogs'] = ['Backup restored.'];
                break;

            case 'set_selected_parent1':
                $state['selectedParent1'] = $this->nullableKemonomimiId($payload['id'] ?? null, $state);
                if ($state['selectedParent1'] !== null && $state['selectedParent1'] === $state['selectedParent2']) {
                    $state['selectedParent2'] = null;
                }
                $state['breedingPreview'] = $this->breedingPreviewForSelection($state);
                break;

            case 'set_selected_parent2':
                $state['selectedParent2'] = $this->nullableKemonomimiId($payload['id'] ?? null, $state);
                if ($state['selectedParent2'] !== null && $state['selectedParent2'] === $state['selectedParent1']) {
                    $state['selectedParent1'] = null;
                }
                $state['breedingPreview'] = $this->breedingPreviewForSelection($state);
                break;

            case 'set_has_seen_onboarding':
                $state['hasSeenOnboarding'] = ($payload['value'] ?? false) === true;
                break;

            case 'start_breeding':
                $state = $this->startBreeding(
                    $state,
                    $this->positiveInt($payload['parent1Id'] ?? null, 'First parent is required.'),
                    $this->positiveInt($payload['parent2Id'] ?? null, 'Second parent is required.')
                );
                break;

            case 'start_training':
                $jobName = $payload['jobName'] ?? null;
                if (!is_string($jobName) || $jobName === '') {
                    throw new RuntimeException('Training job is required.');
                }
                $state = $this->startTraining(
                    $state,
                    $this->positiveInt($payload['kemonomimiId'] ?? null, 'Kemonomimi is required.'),
                    $jobName
                );
                break;

            case 'advance_day':
                $state = $this->advanceDay($state);
                break;

            case 'buy_market':
                $state = $this->buyMarketKemonomimi(
                    $state,
                    $this->positiveInt($payload['marketId'] ?? null, 'Market kemonomimi is required.')
                );
                break;

            case 'sell_kemonomimi':
                $state = $this->sellKemonomimi(
                    $state,
                    $this->positiveInt($payload['kemonomimiId'] ?? null, 'Kemonomimi is required.')
                );
                break;

            default:
                throw new RuntimeException('Unknown game intent.');
        }

        $state['saveDate'] = gmdate('c');
        return $this->refreshAchievements($state);
    }

    public function response(array $save, AuthUser $user): array
    {
        $state = $this->normalizeState($save['state']);

        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $state,
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function normalizeState(array $state): array
    {
        if (!isset($state['kemonomimi']) || !is_array($state['kemonomimi'])) {
            return $this->initialState();
        }

        $base = $this->initialState();
        $kemonomimi = array_values(array_map(fn (array $item): array => $this->normalizeKemonomimi($item), $this->arrayList($state['kemonomimi'])));
        $marketStock = array_values(array_map(fn (array $item): array => $this->normalizeMarketKemonomimi($item), $this->arrayList($state['marketStock'] ?? [])));
        if ($marketStock === []) {
            $marketStock = $this->starterMarketStock();
        }

        $validIds = array_column($kemonomimi, 'id');
        $breedingQueue = array_values(array_filter(
            array_map(fn (array $item): ?array => $this->normalizeBreedingQueueItem($item, $validIds), $this->arrayList($state['breedingQueue'] ?? []))
        ));
        $trainingQueue = array_values(array_filter(
            array_map(fn (array $item): ?array => $this->normalizeTrainingQueueItem($item, $validIds), $this->arrayList($state['trainingQueue'] ?? []))
        ));

        $busyBreeding = [];
        foreach ($breedingQueue as $item) {
            $busyBreeding[] = (int) $item['parent1Id'];
            $busyBreeding[] = (int) $item['parent2Id'];
        }
        $busyTraining = array_map(fn (array $item): int => (int) $item['kemonomimiId'], $trainingQueue);

        $kemonomimi = array_map(function (array $item) use ($busyBreeding, $busyTraining): array {
            if (in_array((int) $item['id'], $busyBreeding, true)) {
                $item['status'] = 'breeding';
            } elseif (in_array((int) $item['id'], $busyTraining, true)) {
                $item['status'] = 'training';
            } else {
                $item['status'] = 'available';
            }
            return $item;
        }, $kemonomimi);

        $normalized = array_replace($base, [
            'saveVersion' => self::SAVE_VERSION,
            'saveDate' => is_string($state['saveDate'] ?? null) ? $state['saveDate'] : gmdate('c'),
            'coins' => max(0, $this->intValue($state['coins'] ?? self::STARTING_COINS)),
            'day' => max(1, $this->intValue($state['day'] ?? self::STARTING_DAY)),
            'kemonomimi' => $kemonomimi,
            'breedingQueue' => $breedingQueue,
            'trainingQueue' => $trainingQueue,
            'marketStock' => $marketStock,
            'achievements' => $this->normalizeAchievements($state['achievements'] ?? []),
            'totalCoinsEarned' => max(0, $this->intValue($state['totalCoinsEarned'] ?? 0)),
            'totalCoinsSpent' => max(0, $this->intValue($state['totalCoinsSpent'] ?? 0)),
            'totalBreedings' => max(0, $this->intValue($state['totalBreedings'] ?? 0)),
            'totalTrainings' => max(0, $this->intValue($state['totalTrainings'] ?? 0)),
            'selectedParent1' => $this->nullableKemonomimiId($state['selectedParent1'] ?? null, ['kemonomimi' => $kemonomimi]),
            'selectedParent2' => $this->nullableKemonomimiId($state['selectedParent2'] ?? null, ['kemonomimi' => $kemonomimi]),
            'hasSeenOnboarding' => ($state['hasSeenOnboarding'] ?? false) === true,
            'lastBackup' => is_string($state['lastBackup'] ?? null) ? $state['lastBackup'] : null,
            'lastDayLogs' => array_values(array_filter($state['lastDayLogs'] ?? [], 'is_string')),
            'lastAdvanceResult' => is_array($state['lastAdvanceResult'] ?? null) ? $state['lastAdvanceResult'] : $this->emptyAdvanceResult(),
        ]);

        $normalized['nextId'] = max(
            1,
            $this->intValue($state['nextId'] ?? 1),
            $this->computeNextId($kemonomimi, $marketStock)
        );
        $normalized['breedingPreview'] = $this->breedingPreviewForSelection($normalized);

        return $this->refreshAchievements($normalized);
    }

    private function startBreeding(array $state, int $parent1Id, int $parent2Id): array
    {
        if ($parent1Id === $parent2Id) {
            throw new RuntimeException('You cannot breed the same kemonomimi with itself.');
        }

        $parent1 = $this->findKemonomimi($state, $parent1Id);
        $parent2 = $this->findKemonomimi($state, $parent2Id);
        if ($parent1 === null || $parent2 === null) {
            throw new RuntimeException('Both parents must be selected to start breeding.');
        }

        if ((int) $state['coins'] < self::BREEDING_COST) {
            throw new RuntimeException('Need at least ' . self::BREEDING_COST . ' coins.');
        }

        if (!$this->isAvailableForQueue($state, $parent1Id) || !$this->isAvailableForQueue($state, $parent2Id)) {
            throw new RuntimeException('One or both selected kemonomimi are currently busy.');
        }

        $preview = $this->buildBreedingPreview($parent1, $parent2, true);
        $queueId = (int) $state['nextId'];
        $state['nextId'] = $queueId + 1;
        $state['coins'] = (int) $state['coins'] - self::BREEDING_COST;
        $state['totalCoinsSpent'] = (int) $state['totalCoinsSpent'] + self::BREEDING_COST;
        $state['breedingQueue'][] = [
            'id' => $queueId,
            'parent1Id' => $parent1Id,
            'parent2Id' => $parent2Id,
            'progress' => 0,
            'expectedStats' => $preview['expectedStats'],
            'expectedTraits' => $preview['expectedTraits'],
            'expectedType' => $preview['expectedType'],
        ];
        $state['kemonomimi'] = array_map(function (array $item) use ($parent1Id, $parent2Id): array {
            if ((int) $item['id'] === $parent1Id || (int) $item['id'] === $parent2Id) {
                $item['status'] = 'breeding';
            }
            return $item;
        }, $state['kemonomimi']);
        $state['selectedParent1'] = null;
        $state['selectedParent2'] = null;
        $state['breedingPreview'] = null;
        $state['lastDayLogs'] = ['Started breeding ' . $parent1['name'] . ' and ' . $parent2['name'] . '.'];

        return $state;
    }

    private function startTraining(array $state, int $kemonomimiId, string $jobName): array
    {
        $kemonomimi = $this->findKemonomimi($state, $kemonomimiId);
        if ($kemonomimi === null) {
            throw new RuntimeException('Selected kemonomimi is missing.');
        }

        $job = $this->findJob($jobName);
        if ($job === null) {
            throw new RuntimeException('Invalid training job.');
        }

        if ((int) $state['coins'] < (int) $job['trainingCost']) {
            throw new RuntimeException('Need at least ' . $job['trainingCost'] . ' coins to start ' . $job['name'] . '.');
        }

        if (!$this->isAvailableForQueue($state, $kemonomimiId)) {
            throw new RuntimeException($kemonomimi['name'] . ' is not available to train right now.');
        }

        $queueId = (int) $state['nextId'];
        $state['nextId'] = $queueId + 1;
        $state['coins'] = (int) $state['coins'] - (int) $job['trainingCost'];
        $state['totalCoinsSpent'] = (int) $state['totalCoinsSpent'] + (int) $job['trainingCost'];
        $state['trainingQueue'][] = [
            'id' => $queueId,
            'kemonomimiId' => $kemonomimiId,
            'job' => $job,
            'progress' => 0,
        ];
        $state['kemonomimi'] = $this->updateKemonomimi($state['kemonomimi'], $kemonomimiId, function (array $item): array {
            $item['status'] = 'training';
            return $item;
        });
        $state['lastDayLogs'] = ['Started training ' . $kemonomimi['name'] . ' in ' . $job['name'] . '.'];

        return $state;
    }

    private function advanceDay(array $state): array
    {
        $nextDay = (int) $state['day'] + 1;
        $logs = [];
        $earnedCoins = 0;
        $completedBreedings = 0;
        $completedTrainings = 0;
        $nextKemonomimi = array_map(function (array $item): array {
            $item['age'] = (int) $item['age'] + 1;
            return $item;
        }, $state['kemonomimi']);
        $nextBreedingQueue = [];
        $nextTrainingQueue = [];

        foreach ($state['breedingQueue'] as $item) {
            $item['progress'] = (int) $item['progress'] + 1;
            if ((int) $item['progress'] < self::BREEDING_DURATION_DAYS) {
                $nextBreedingQueue[] = $item;
                continue;
            }

            $parent1 = $this->findKemonomimi(['kemonomimi' => $nextKemonomimi], (int) $item['parent1Id']);
            $parent2 = $this->findKemonomimi(['kemonomimi' => $nextKemonomimi], (int) $item['parent2Id']);
            if ($parent1 === null || $parent2 === null) {
                $logs[] = 'A breeding project ended but a parent was missing.';
                continue;
            }

            $preview = [
                'expectedStats' => $this->normalizeStats($item['expectedStats'] ?? []),
                'expectedTraits' => is_array($item['expectedTraits'] ?? null) ? array_values(array_filter($item['expectedTraits'], 'is_string')) : [],
                'expectedType' => is_string($item['expectedType'] ?? null) ? $item['expectedType'] : $parent1['type']['name'],
            ];
            $child = $this->buildOffspring($parent1, $parent2, (int) $state['nextId'], $nextDay, $preview);
            $state['nextId'] = (int) $state['nextId'] + 1;
            $nextKemonomimi[] = $child;
            $nextKemonomimi = $this->attachChild($nextKemonomimi, (int) $parent1['id'], (int) $child['id']);
            $nextKemonomimi = $this->attachChild($nextKemonomimi, (int) $parent2['id'], (int) $child['id']);
            $nextKemonomimi = $this->updateKemonomimi($nextKemonomimi, (int) $parent1['id'], fn (array $parent): array => array_replace($parent, ['status' => 'available']));
            $nextKemonomimi = $this->updateKemonomimi($nextKemonomimi, (int) $parent2['id'], fn (array $parent): array => array_replace($parent, ['status' => 'available']));
            $completedBreedings++;
            $logs[] = 'Breeding complete: ' . $parent1['name'] . ' and ' . $parent2['name'] . ' produced ' . $child['name'] . '.';
        }

        foreach ($state['trainingQueue'] as $item) {
            $progress = (int) $item['progress'] + 1;
            $kemonomimi = $this->findKemonomimi(['kemonomimi' => $nextKemonomimi], (int) $item['kemonomimiId']);
            if ($kemonomimi === null) {
                continue;
            }

            $job = $this->findJob((string) $item['job']['name']);
            if ($job === null) {
                continue;
            }

            if ($progress < (int) $job['trainingTime']) {
                $item['progress'] = $progress;
                $nextTrainingQueue[] = $item;
                continue;
            }

            $completion = $this->completeTraining($kemonomimi, $job);
            $nextKemonomimi = $this->updateKemonomimi($nextKemonomimi, (int) $kemonomimi['id'], fn (): array => $completion['kemonomimi']);
            $completedTrainings++;
            $earnedCoins += (int) $completion['earnedCoins'];
            $logs[] = $kemonomimi['name'] . ' completed ' . $job['name'] . ' and earned ' . $completion['earnedCoins'] . ' coins.';
        }

        $state['day'] = $nextDay;
        $state['kemonomimi'] = $nextKemonomimi;
        $state['breedingQueue'] = $nextBreedingQueue;
        $state['trainingQueue'] = $nextTrainingQueue;
        $state['coins'] = (int) $state['coins'] + $earnedCoins;
        $state['totalCoinsEarned'] = (int) $state['totalCoinsEarned'] + $earnedCoins;
        $state['totalBreedings'] = (int) $state['totalBreedings'] + $completedBreedings;
        $state['totalTrainings'] = (int) $state['totalTrainings'] + $completedTrainings;
        $state['lastDayLogs'] = $logs;
        $state['lastAdvanceResult'] = [
            'completedBreedings' => $completedBreedings,
            'completedTrainings' => $completedTrainings,
            'earnedCoins' => $earnedCoins,
            'logs' => $logs,
        ];

        return $state;
    }

    private function buyMarketKemonomimi(array $state, int $marketId): array
    {
        $selected = null;
        foreach ($state['marketStock'] as $item) {
            if ((int) $item['id'] === $marketId) {
                $selected = $item;
                break;
            }
        }

        if ($selected === null) {
            throw new RuntimeException('Market kemonomimi is no longer available.');
        }

        $price = (int) $selected['price'];
        if ((int) $state['coins'] < $price) {
            throw new RuntimeException('Not enough coins to buy this kemonomimi.');
        }

        $selected['status'] = 'available';
        $state['coins'] = (int) $state['coins'] - $price;
        $state['totalCoinsSpent'] = (int) $state['totalCoinsSpent'] + $price;
        $state['kemonomimi'][] = $selected;
        $state['marketStock'] = array_values(array_filter(
            $state['marketStock'],
            fn (array $item): bool => (int) $item['id'] !== $marketId
        ));
        $state['lastDayLogs'] = ['Purchased ' . $selected['name'] . ' for ' . $price . ' coins.'];

        return $state;
    }

    private function sellKemonomimi(array $state, int $kemonomimiId): array
    {
        $selected = $this->findKemonomimi($state, $kemonomimiId);
        if ($selected === null) {
            throw new RuntimeException('Selected kemonomimi is missing.');
        }

        if (!$this->isAvailableForQueue($state, $kemonomimiId)) {
            throw new RuntimeException($selected['name'] . ' is not available to sell right now.');
        }

        $price = (int) ($selected['price'] ?? 100);
        $state['coins'] = (int) $state['coins'] + $price;
        $state['totalCoinsEarned'] = (int) $state['totalCoinsEarned'] + $price;
        $state['kemonomimi'] = array_values(array_filter(
            $state['kemonomimi'],
            fn (array $item): bool => (int) $item['id'] !== $kemonomimiId
        ));
        $state['lastDayLogs'] = ['Sold ' . $selected['name'] . ' for ' . $price . ' coins.'];

        return $state;
    }

    private function starterKemonomimi(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'Akiyama',
                'type' => $this->typeByName('Nekomimi'),
                'stats' => ['strength' => 40, 'agility' => 70, 'intelligence' => 60, 'charisma' => 55, 'endurance' => 50, 'loyalty' => 45],
                'hairColor' => 'Black',
                'eyeColor' => 'Blue',
                'personality' => 'Playful',
                'age' => 19,
                'status' => 'available',
                'trainedJobs' => [],
                'parents' => null,
                'children' => [],
                'price' => 200,
            ],
            [
                'id' => 2,
                'name' => 'Yukiko',
                'type' => $this->typeByName('Inumimi'),
                'stats' => ['strength' => 65, 'agility' => 60, 'intelligence' => 55, 'charisma' => 70, 'endurance' => 70, 'loyalty' => 85],
                'hairColor' => 'Brown',
                'eyeColor' => 'Green',
                'personality' => 'Gentle',
                'age' => 21,
                'status' => 'available',
                'trainedJobs' => ['Physical Labor'],
                'parents' => null,
                'children' => [],
                'price' => 250,
            ],
        ];
    }

    private function starterMarketStock(): array
    {
        return [
            [
                'id' => 101,
                'name' => 'Miko',
                'type' => $this->typeByName('Kitsunemimi'),
                'stats' => ['strength' => 45, 'agility' => 65, 'intelligence' => 85, 'charisma' => 60, 'endurance' => 55, 'loyalty' => 40],
                'hairColor' => 'Red',
                'eyeColor' => 'Gold',
                'personality' => 'Mischievous',
                'age' => 18,
                'status' => 'available',
                'trainedJobs' => [],
                'parents' => null,
                'children' => [],
                'price' => 300,
            ],
            [
                'id' => 102,
                'name' => 'Rei',
                'type' => $this->typeByName('Usagimimi'),
                'stats' => ['strength' => 35, 'agility' => 80, 'intelligence' => 65, 'charisma' => 50, 'endurance' => 60, 'loyalty' => 60],
                'hairColor' => 'Silver',
                'eyeColor' => 'Purple',
                'personality' => 'Calm',
                'age' => 20,
                'status' => 'available',
                'trainedJobs' => [],
                'parents' => null,
                'children' => [],
                'price' => 220,
            ],
        ];
    }

    private function normalizeKemonomimi(array $source): array
    {
        $type = $this->normalizeType($source['type'] ?? []);
        $status = in_array($source['status'] ?? '', ['available', 'training', 'breeding'], true)
            ? (string) $source['status']
            : 'available';
        $price = $this->intValue($source['price'] ?? 0);

        return [
            'id' => max(1, $this->intValue($source['id'] ?? 1)),
            'name' => is_string($source['name'] ?? null) && $source['name'] !== '' ? $source['name'] : 'Kemonomimi',
            'type' => $type,
            'stats' => $this->normalizeStats($source['stats'] ?? $type['baseStats']),
            'hairColor' => is_string($source['hairColor'] ?? null) ? $source['hairColor'] : self::HAIR_COLORS[0],
            'eyeColor' => is_string($source['eyeColor'] ?? null) ? $source['eyeColor'] : self::EYE_COLORS[0],
            'personality' => is_string($source['personality'] ?? null) ? $source['personality'] : self::PERSONALITIES[0],
            'age' => max(1, $this->intValue($source['age'] ?? 18)),
            'status' => $status,
            'trainedJobs' => array_values(array_filter($source['trainedJobs'] ?? [], 'is_string')),
            'parents' => $this->nullableIdList($source['parents'] ?? null),
            'children' => $this->idList($source['children'] ?? []),
            'price' => $price > 0 ? $price : null,
        ];
    }

    private function normalizeMarketKemonomimi(array $source): array
    {
        $kemonomimi = $this->normalizeKemonomimi($source);
        $price = $this->intValue($source['price'] ?? 0);
        $kemonomimi['price'] = $price > 0 ? $price : max(80, (int) round(array_sum($kemonomimi['stats']) / 3));
        return $kemonomimi;
    }

    private function normalizeBreedingQueueItem(array $source, array $validIds): ?array
    {
        $parent1Id = $this->intValue($source['parent1Id'] ?? 0);
        $parent2Id = $this->intValue($source['parent2Id'] ?? 0);
        if (!in_array($parent1Id, $validIds, true) || !in_array($parent2Id, $validIds, true)) {
            return null;
        }

        return [
            'id' => max(1, $this->intValue($source['id'] ?? 1)),
            'parent1Id' => $parent1Id,
            'parent2Id' => $parent2Id,
            'progress' => max(0, $this->intValue($source['progress'] ?? 0)),
            'expectedStats' => $this->normalizeStats($source['expectedStats'] ?? []),
            'expectedTraits' => array_values(array_filter($source['expectedTraits'] ?? [], 'is_string')),
            'expectedType' => is_string($source['expectedType'] ?? null) ? $source['expectedType'] : 'Nekomimi',
        ];
    }

    private function normalizeTrainingQueueItem(array $source, array $validIds): ?array
    {
        $kemonomimiId = $this->intValue($source['kemonomimiId'] ?? 0);
        if (!in_array($kemonomimiId, $validIds, true)) {
            return null;
        }

        $jobName = is_array($source['job'] ?? null)
            ? (string) ($source['job']['name'] ?? '')
            : (string) ($source['job'] ?? '');
        $job = $this->findJob($jobName);
        if ($job === null) {
            return null;
        }

        return [
            'id' => max(1, $this->intValue($source['id'] ?? 1)),
            'kemonomimiId' => $kemonomimiId,
            'job' => $job,
            'progress' => max(0, $this->intValue($source['progress'] ?? 0)),
        ];
    }

    private function normalizeStats(mixed $raw): array
    {
        $source = is_array($raw) ? $raw : [];
        $stats = [];
        foreach (self::STATS as $stat) {
            $stats[$stat] = $this->clampStat($this->intValue($source[$stat] ?? 40));
        }

        return $stats;
    }

    private function normalizeType(mixed $raw): array
    {
        if (!is_array($raw)) {
            return self::TYPES[0];
        }

        $name = is_string($raw['name'] ?? null) ? $raw['name'] : '';
        $type = $this->typeByName($name);
        if ($type !== self::TYPES[0] || $name === self::TYPES[0]['name']) {
            return $type;
        }

        return [
            'name' => $name !== '' ? $name : self::TYPES[0]['name'],
            'animal' => is_string($raw['animal'] ?? null) ? $raw['animal'] : self::TYPES[0]['animal'],
            'traits' => array_values(array_filter($raw['traits'] ?? [], 'is_string')),
            'jobBonuses' => is_array($raw['jobBonuses'] ?? null) ? $raw['jobBonuses'] : [],
            'baseStats' => $this->normalizeStats($raw['baseStats'] ?? []),
        ];
    }

    private function normalizeAchievements(mixed $raw): array
    {
        if (!is_array($raw)) {
            return $this->achievementTemplates();
        }

        $byId = [];
        foreach ($raw as $item) {
            if (!is_array($item) || !is_string($item['id'] ?? null)) {
                continue;
            }
            $byId[$item['id']] = $item;
        }

        return array_map(function (array $template) use ($byId): array {
            $saved = $byId[$template['id']] ?? [];
            return [
                ...$template,
                'unlocked' => ($saved['unlocked'] ?? false) === true,
                'unlockedDate' => is_string($saved['unlockedDate'] ?? null) ? $saved['unlockedDate'] : null,
            ];
        }, self::ACHIEVEMENTS);
    }

    private function achievementTemplates(): array
    {
        return array_map(fn (array $achievement): array => [
            ...$achievement,
            'unlocked' => false,
            'unlockedDate' => null,
        ], self::ACHIEVEMENTS);
    }

    private function refreshAchievements(array $state): array
    {
        $stats = [
            'totalKemonomimi' => count($state['kemonomimi']),
            'totalBreedings' => (int) $state['totalBreedings'],
            'totalTrainings' => (int) $state['totalTrainings'],
            'totalCoinsEarned' => (int) $state['totalCoinsEarned'],
            'daysSurvived' => (int) $state['day'],
        ];

        $state['achievements'] = array_map(function (array $achievement) use ($stats): array {
            $shouldUnlock = match ($achievement['id']) {
                'first_kemonomimi' => $stats['totalKemonomimi'] >= 1,
                'collector' => $stats['totalKemonomimi'] >= 10,
                'breeder' => $stats['totalBreedings'] >= 1,
                'trainer' => $stats['totalTrainings'] >= 1,
                'wealthy' => $stats['totalCoinsEarned'] >= 10000,
                'survivor' => $stats['daysSurvived'] >= 30,
                'master_trainer' => $stats['totalTrainings'] >= 50,
                'family_founder' => $stats['totalBreedings'] >= 5,
                default => false,
            };

            if (($achievement['unlocked'] ?? false) === true || !$shouldUnlock) {
                return $achievement;
            }

            $achievement['unlocked'] = true;
            $achievement['unlockedDate'] = gmdate('c');
            return $achievement;
        }, $this->normalizeAchievements($state['achievements'] ?? []));

        return $state;
    }

    private function buildBreedingPreview(array $parent1, array $parent2, bool $withJitter): array
    {
        $stats = [];
        foreach (self::STATS as $stat) {
            $baseValue = (((int) $parent1['stats'][$stat]) + ((int) $parent2['stats'][$stat])) / 2;
            $stats[$stat] = $this->clampStat((int) round($baseValue) + ($withJitter ? random_int(-4, 4) : 0));
        }

        $traits = array_values(array_unique([...$parent1['type']['traits'], ...$parent2['type']['traits']]));
        if ($withJitter) {
            $traits = array_values(array_filter($traits, fn (): bool => random_int(1, 100) <= 75));
        }

        return [
            'expectedStats' => $stats,
            'expectedTraits' => $traits !== [] ? array_slice($traits, 0, 4) : ['Bright', 'Curious'],
            'expectedType' => $withJitter && random_int(0, 1) === 1 ? $parent2['type']['name'] : $parent1['type']['name'],
        ];
    }

    private function breedingPreviewForSelection(array $state): ?array
    {
        if (!is_int($state['selectedParent1']) || !is_int($state['selectedParent2'])) {
            return null;
        }

        $parent1 = $this->findKemonomimi($state, $state['selectedParent1']);
        $parent2 = $this->findKemonomimi($state, $state['selectedParent2']);
        if ($parent1 === null || $parent2 === null) {
            return null;
        }

        return $this->buildBreedingPreview($parent1, $parent2, false);
    }

    private function buildOffspring(array $parent1, array $parent2, int $nextId, int $day, array $preview): array
    {
        $type = $this->typeByName((string) $preview['expectedType']);
        $stats = [];
        foreach (self::STATS as $stat) {
            $stats[$stat] = $this->clampStat((int) $preview['expectedStats'][$stat] + random_int(-2, 2));
        }

        $suffix = random_int(1, 99);
        $statTotal = array_sum($stats);

        return [
            'id' => $nextId,
            'name' => $parent1['name'] . '-' . $parent2['name'] . ' ' . $suffix,
            'type' => $type,
            'stats' => $stats,
            'hairColor' => $this->randomFrom([(string) $parent1['hairColor'], (string) $parent2['hairColor']]),
            'eyeColor' => $this->randomFrom([(string) $parent1['eyeColor'], (string) $parent2['eyeColor']]),
            'personality' => $this->randomFrom([(string) $parent1['personality'], (string) $parent2['personality']]),
            'age' => 1,
            'status' => 'available',
            'trainedJobs' => [],
            'parents' => [(int) $parent1['id'], (int) $parent2['id']],
            'children' => [],
            'price' => max(90, (int) round(($statTotal * $day) / 2)),
        ];
    }

    private function completeTraining(array $kemonomimi, array $job): array
    {
        $earnedFromStats = 0;
        $stats = $kemonomimi['stats'];
        foreach ($job['requiredStats'] as $stat) {
            $gain = random_int(2, 6);
            $stats[$stat] = $this->clampStat((int) $stats[$stat] + $gain);
            $earnedFromStats += $gain;
        }

        $reward = max(10, (int) round(((int) $kemonomimi['age'] + $earnedFromStats * 2) * (float) $job['salaryMultiplier']));
        $trainedJobs = $kemonomimi['trainedJobs'];
        if (!in_array($job['name'], $trainedJobs, true)) {
            $trainedJobs[] = $job['name'];
        }

        $kemonomimi['status'] = 'available';
        $kemonomimi['trainedJobs'] = $trainedJobs;
        $kemonomimi['stats'] = $stats;

        return [
            'kemonomimi' => $kemonomimi,
            'earnedCoins' => $reward,
        ];
    }

    private function findKemonomimi(array $state, int $id): ?array
    {
        foreach ($state['kemonomimi'] as $item) {
            if ((int) $item['id'] === $id) {
                return $item;
            }
        }

        return null;
    }

    private function findJob(string $name): ?array
    {
        foreach (self::JOBS as $job) {
            if ($job['name'] === $name) {
                return $job;
            }
        }

        return null;
    }

    private function isAvailableForQueue(array $state, int $kemonomimiId): bool
    {
        $kemonomimi = $this->findKemonomimi($state, $kemonomimiId);
        if ($kemonomimi === null || $kemonomimi['status'] !== 'available') {
            return false;
        }

        foreach ($state['breedingQueue'] as $item) {
            if ((int) $item['parent1Id'] === $kemonomimiId || (int) $item['parent2Id'] === $kemonomimiId) {
                return false;
            }
        }

        foreach ($state['trainingQueue'] as $item) {
            if ((int) $item['kemonomimiId'] === $kemonomimiId) {
                return false;
            }
        }

        return true;
    }

    private function updateKemonomimi(array $collection, int $id, callable $updater): array
    {
        return array_map(function (array $item) use ($id, $updater): array {
            if ((int) $item['id'] !== $id) {
                return $item;
            }

            return $updater($item);
        }, $collection);
    }

    private function attachChild(array $collection, int $parentId, int $childId): array
    {
        return $this->updateKemonomimi($collection, $parentId, function (array $parent) use ($childId): array {
            $parent['children'] = array_values(array_unique([...$parent['children'], $childId]));
            return $parent;
        });
    }

    private function typeByName(string $name): array
    {
        foreach (self::TYPES as $type) {
            if ($type['name'] === $name) {
                return $type;
            }
        }

        return self::TYPES[0];
    }

    private function computeNextId(array $kemonomimi, array $marketStock): int
    {
        $maxId = 0;
        foreach ([...$kemonomimi, ...$marketStock] as $item) {
            $maxId = max($maxId, (int) $item['id']);
        }

        return $maxId + 1;
    }

    private function nullableKemonomimiId(mixed $value, array $state): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $id = $this->intValue($value);
        return $this->findKemonomimi($state, $id) !== null ? $id : null;
    }

    private function positiveInt(mixed $value, string $message): int
    {
        $id = $this->intValue($value);
        if ($id <= 0) {
            throw new RuntimeException($message);
        }

        return $id;
    }

    private function idList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(fn (mixed $item): int => $this->intValue($item), $value), fn (int $id): bool => $id > 0));
    }

    private function nullableIdList(mixed $value): ?array
    {
        $ids = $this->idList($value);
        return $ids === [] ? null : $ids;
    }

    private function arrayList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter($value, 'is_array'));
    }

    private function intValue(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    private function clampStat(int $value): int
    {
        return min(100, max(0, $value));
    }

    private function randomFrom(array $values): string
    {
        return (string) $values[random_int(0, count($values) - 1)];
    }

    private function emptyAdvanceResult(): array
    {
        return [
            'completedBreedings' => 0,
            'completedTrainings' => 0,
            'earnedCoins' => 0,
            'logs' => [],
        ];
    }
}
