import { ArrowDownIcon, ArrowUpIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

type Props = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  batchColor: BadgeColor;
  iconType: string | undefined;
  metricType: string | undefined;
  metricValue: string | number | undefined;
};

export default function UserMetrics({
  icon,
  iconType,
  batchColor,
  metricType,
  metricValue,
}: Props) {
  const Icon = icon;
  return (
    <>
      <div className="rounded-2xl h-fit flex flex-row items-start gap-4 border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Icon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {metricType}
            </span>
            <div className="flex flex-row items-center justify-between mt-2 gap-2">
              <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metricValue}
              </h4>
              <Badge color={batchColor}>
                {iconType === "ArrowUpIcon" ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon />
                )}
                9.05%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
