import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/lib/apiComponent/hooks';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Star } from 'lucide-react';
import {
    RANK_EMOJIS,
    RANK_COLORS,
    RANK_LABELS,
} from '@/types/gamification';

interface LevelWidgetProps {
  variant?: 'default' | 'compact' | 'minimal';
  showProgress?: boolean;
  clickable?: boolean;
}

export function LevelWidget({
  variant = 'default',
  showProgress = true,
  clickable = true,
}: LevelWidgetProps) {
  const navigate = useNavigate();
  const { getLevel, loading } = useGamification();
  const { level, setLevel, setLevelLoading } = useGamificationStore();

  useEffect(() => {
    if (!level) {
      loadLevel();
    }
  }, []);

  const loadLevel = async () => {
    setLevelLoading(true);
    const data = await getLevel();
    if (data) {
      setLevel(data);
    }
    setLevelLoading(false);
  };

  const handleClick = () => {
    if (clickable) {
      navigate('/gamification');
    }
  };

  if (loading || !level) {
    return <LevelWidgetSkeleton variant={variant} />;
  }

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center gap-2 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={handleClick}
            >
              <div
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: `conic-gradient(${RANK_COLORS[level.rank]} ${level.progressPercent}%, #e5e7eb ${level.progressPercent}%)`,
                  padding: '2px',
                }}
              >
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  {level.level}
                </div>
              </div>
              <span className="text-sm font-medium">{RANK_EMOJIS[level.rank]}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-semibold">Niveau {level.level}</div>
              <div className="text-xs text-muted-foreground">
                {RANK_LABELS[level.rank].fr}
              </div>
              <div className="text-xs">
                {level.currentXP.toLocaleString()} / {(level.currentXP + level.xpToNextLevel).toLocaleString()} XP
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={`${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
              style={{
                background: `conic-gradient(${RANK_COLORS[level.rank]} ${level.progressPercent}%, #e5e7eb ${level.progressPercent}%)`,
                padding: '3px',
              }}
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                {level.level}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Niveau {level.level}</span>
                <span>{RANK_EMOJIS[level.rank]}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {RANK_LABELS[level.rank].fr}
              </div>
              {showProgress && (
                <div className="mt-2">
                  <Progress value={level.progressPercent} className="h-1.5" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {level.progressPercent.toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={`${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Niveau & Progression
        </CardTitle>
        <CardDescription>Votre évolution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          {/* Level Badge */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              background: `conic-gradient(${RANK_COLORS[level.rank]} ${level.progressPercent}%, #e5e7eb ${level.progressPercent}%)`,
              padding: '4px',
            }}
          >
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              {level.level}
            </div>
          </div>

          {/* Level Info */}
          <div className="flex-1 ml-4">
            <div className="text-lg font-bold">Niveau {level.level}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{RANK_EMOJIS[level.rank]}</span>
              <span>{RANK_LABELS[level.rank].fr}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {level.totalXP.toLocaleString()} XP Total
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{level.progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={level.progressPercent} className="h-2.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{level.currentXP.toLocaleString()} XP</span>
              <span>{(level.currentXP + level.xpToNextLevel).toLocaleString()} XP</span>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Encore {level.xpToNextLevel.toLocaleString()} XP pour le niveau {level.level + 1}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LevelWidgetSkeleton({ variant }: { variant: 'default' | 'compact' | 'minimal' }) {
  if (variant === 'minimal') {
    return (
      <div className="inline-flex items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-6 h-6" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

