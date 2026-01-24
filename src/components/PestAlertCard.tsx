import { Bug, AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">{t('highRisk')}</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 hover:bg-amber-600">{t('mediumRisk')}</Badge>;
      default:
        return <Badge variant="secondary">{t('lowRisk')}</Badge>;
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Card className="card-elevated p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
          <Bug className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-farmer-lg font-semibold text-foreground">
            {t('pestAlerts')}
          </h2>
          <p className="text-farmer-sm text-muted-foreground">
            {t('pestAlertsSubtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-xl border p-4 transition-all ${getRiskColor(alert.risk)}`}
          >
            <button
              onClick={() => toggleExpand(index)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 shrink-0 ${
                  alert.risk === 'high' ? 'text-destructive' : 
                  alert.risk === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-farmer-base">{alert.pest}</span>
                    {getRiskBadge(alert.risk)}
                  </div>
                  <p className="mt-1 text-farmer-sm opacity-80">{alert.conditions}</p>
                </div>
              </div>
              {expandedIndex === index ? (
                <ChevronUp className="h-5 w-5 shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0" />
              )}
            </button>

            {expandedIndex === index && (
              <div className="mt-4 border-t border-current/10 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium text-farmer-sm">{t('preventiveMeasures')}</span>
                </div>
                <ul className="space-y-2">
                  {alert.prevention.map((measure, i) => (
                    <li key={i} className="flex items-start gap-2 text-farmer-sm">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PestAlertCard;
