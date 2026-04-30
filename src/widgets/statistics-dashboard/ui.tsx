import React, { useState, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';
import { GameAdapter, ParticipantAdapter } from '../../shared/lib/data-adapter';
import { ParticipantAvatar } from '../../shared/ui';
import type { GameStatistics, GameByTitle } from '../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StatisticsDashboardProps {
  refreshTrigger?: number;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ refreshTrigger }) => {
  const [statistics, setStatistics] = useState<GameStatistics[]>([]);
  const [gameStatistics, setGameStatistics] = useState<GameByTitle[]>([]);
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());

  const loadStatistics = async () => {
    const [stats, gameStats, participantsData] = await Promise.all([
      GameAdapter.getStatistics(),
      GameAdapter.getStatisticsByGames(),
      ParticipantAdapter.getAll()
    ]);
    setStatistics(stats.sort((a, b) => b.winPercentage - a.winPercentage));
    setGameStatistics(gameStats);
    
    const participantsMap = new Map();
    participantsData.forEach(p => participantsMap.set(p.id, p));
    setParticipants(participantsMap);
  };

  useEffect(() => {
    loadStatistics();
  }, [refreshTrigger]);

  return (
    <Card className="pixel-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-4 text-primary" />
          Статистика
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 flex h-auto min-h-11 w-full items-stretch border-2 border-slate-900 bg-slate-200 p-1">
            <TabsTrigger value="general" className="h-9 w-1/2 gap-2 rounded-md px-3 py-0 font-semibold whitespace-nowrap">
              <Users />
              Общая
            </TabsTrigger>
            <TabsTrigger value="byGames" className="h-9 w-1/2 gap-2 rounded-md px-3 py-0 font-semibold whitespace-nowrap">
              <Trophy />
              По играм
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {statistics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Статистика будет доступна после добавления игр
              </p>
            ) : (
              <>
              <div className="overflow-x-auto rounded-md border-2 border-slate-900 bg-white hidden md:block">
                <Table className="table-fixed min-w-[620px]">
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="w-[44%] whitespace-normal text-xs font-bold uppercase">Участник</TableHead>
                      <TableHead className="w-[16%] whitespace-normal text-xs font-bold uppercase">Игр</TableHead>
                      <TableHead className="w-[16%] whitespace-normal text-xs font-bold uppercase">Побед</TableHead>
                      <TableHead className="w-[24%] whitespace-normal text-xs font-bold uppercase">Процент побед</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statistics.map((record) => {
                      const participant = participants.get(record.participantId);
                      return (
                        <TableRow key={record.participantId}>
                          <TableCell className="whitespace-normal">
                            <div className="flex items-center gap-2">
                              {participant && (
                                <ParticipantAvatar
                                  name={participant.name}
                                  color={participant.color}
                                  avatarUrl={participant.avatarUrl}
                                  size={28}
                                  shape="square"
                                />
                              )}
                              <span className="font-semibold">{record.participantName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-base font-semibold">{record.totalGames}</TableCell>
                          <TableCell className="text-base font-semibold">{record.wins}</TableCell>
                          <TableCell className="whitespace-normal">
                            <div className="flex min-w-0 items-center gap-2">
                              <Progress value={record.winPercentage} className="h-2 w-full max-w-24" />
                              <span className="text-xs font-semibold text-muted-foreground">{record.winPercentage}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-2 md:hidden">
                {statistics.map((record) => {
                  const participant = participants.get(record.participantId);
                  return (
                    <div key={record.participantId} className="rounded-md border-2 border-slate-900 bg-white p-3">
                      <div className="mb-2 flex items-center gap-2">
                        {participant && (
                          <ParticipantAvatar
                            name={participant.name}
                            color={participant.color}
                            avatarUrl={participant.avatarUrl}
                            size={24}
                            shape="square"
                          />
                        )}
                        <span className="font-semibold">{record.participantName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Игр:</span> {record.totalGames}</div>
                        <div><span className="text-muted-foreground">Побед:</span> {record.wins}</div>
                        <div><span className="text-muted-foreground">Винрейт:</span> {record.winPercentage}%</div>
                      </div>
                      <Progress value={record.winPercentage} className="mt-2 h-2" />
                    </div>
                  );
                })}
              </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="byGames">
            {gameStatistics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Статистика по играм будет доступна после добавления игр
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {gameStatistics.map((gameStats) => (
                  <Card key={gameStats.gameName} size="sm" className="pixel-panel">
                    <CardHeader className="border-b-2 border-slate-900 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{gameStats.gameName}</CardTitle>
                        <Badge variant="secondary" className="border-2 border-slate-900 bg-slate-200 text-slate-900">{gameStats.gamesCount}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto rounded-md border-2 border-slate-900 bg-white hidden md:block">
                      <Table className="table-fixed min-w-[600px]">
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead className="w-[44%] whitespace-normal text-xs font-bold uppercase">Участник</TableHead>
                            <TableHead className="w-[16%] whitespace-normal text-xs font-bold uppercase">Игр</TableHead>
                            <TableHead className="w-[16%] whitespace-normal text-xs font-bold uppercase">Побед</TableHead>
                            <TableHead className="w-[24%] whitespace-normal text-xs font-bold uppercase">Процент</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gameStats.participants.map((record) => {
                            const participant = participants.get(record.participantId);
                            return (
                              <TableRow key={record.participantId}>
                                <TableCell className="whitespace-normal">
                                  <div className="flex items-center gap-2">
                                    {participant && (
                                      <ParticipantAvatar
                                        name={participant.name}
                                        color={participant.color}
                                        avatarUrl={participant.avatarUrl}
                                        size={24}
                                        shape="square"
                                      />
                                    )}
                                    <span className="font-semibold">{record.participantName}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-base font-semibold">{record.totalGames}</TableCell>
                                <TableCell className="text-base font-semibold">{record.wins}</TableCell>
                                <TableCell className="whitespace-normal">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Progress value={record.winPercentage} className="h-2 w-full max-w-24" />
                                    <span className="text-xs font-semibold text-muted-foreground">{record.winPercentage}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      </div>
                      <div className="grid gap-2 md:hidden">
                        {gameStats.participants.map((record) => {
                          const participant = participants.get(record.participantId);
                          return (
                            <div key={record.participantId} className="rounded-md border-2 border-slate-900 bg-white p-3">
                              <div className="mb-2 flex items-center gap-2">
                                {participant && (
                                  <ParticipantAvatar
                                    name={participant.name}
                                    color={participant.color}
                                    avatarUrl={participant.avatarUrl}
                                    size={24}
                                    shape="square"
                                  />
                                )}
                                <span className="font-semibold">{record.participantName}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div><span className="text-muted-foreground">Игр:</span> {record.totalGames}</div>
                                <div><span className="text-muted-foreground">Побед:</span> {record.wins}</div>
                                <div><span className="text-muted-foreground">Винрейт:</span> {record.winPercentage}%</div>
                              </div>
                              <Progress value={record.winPercentage} className="mt-2 h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};