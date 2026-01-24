import { Bug, AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ListenButton from './ListenButton';

export interface PestAlert {
  pest: string;
  risk: 'low' | 'medium' | 'high';
  conditions: string;
  prevention: string[];
}

interface PestAlertCardProps {
  alerts: PestAlert[];
}

const PestAlertCard = ({ alerts }: PestAlertCardProps) => {
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!alerts || alerts.length === 0) return null;

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'high':
        return {
          container: 'from-destructive/10 to-destructive/5 border-destructive/30',
          icon: 'text-destructive',
          badge: 'bg-destructive hover:bg-destructive/90'
        };
      case 'medium':
        return {
          container: 'from-amber-100/80 to-amber-50/50 border-amber-300/40 dark:from-amber-900/20 dark:to-amber-900/10 dark:border-amber-700/40',
          icon: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500 hover:bg-amber-600'
        };
      default:
        return {
          container: 'from-primary/10 to-primary/5 border-primary/30',
          icon: 'text-primary',
          badge: 'bg-primary/80 hover:bg-primary/90'
        };
    }
  };

  const getRiskBadge = (risk: string) => {
    const styles = getRiskStyles(risk);
    switch (risk) {
      case 'high':
        return <Badge className={styles.badge}>{t('highRisk')}</Badge>;
      case 'medium':
        return <Badge className={styles.badge}>{t('mediumRisk')}</Badge>;
      default:
        return <Badge variant="secondary">{t('lowRisk')}</Badge>;
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Card className="card-elevated overflow-hidden border-0">
      <div className="bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {t('pestAlerts')}
            </h2>
            <p className="text-sm text-white/70">
              {t('pestAlertsSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {alerts.map((alert, index) => {
          const styles = getRiskStyles(alert.risk);
          return (
            <div
              key={index}
              className={`rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 ${styles.container}`}
            >
              <button
                onClick={() => toggleExpand(index)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background/50 ${styles.icon}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{alert.pest}</span>
                      {getRiskBadge(alert.risk)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{alert.conditions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <ListenButton 
                    text={`${alert.pest}: ${alert.conditions}. Prevention: ${alert.prevention.join('. ')}`}
                    compact
                    className="h-8 w-8"
                  />
                  {expandedIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedIndex === index && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm text-foreground">{t('preventiveMeasures')}</span>
                  </div>
                  <ul className="space-y-2 ml-6">
                    {alert.prevention.map((measure, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        <span>{measure}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PestAlertCard;