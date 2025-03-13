import clsx from "clsx"; // Import clsx for class merging
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";

const SummaryCard = ({ title, value, icon: Icon, className }) => {
  return (
    <Card className={clsx("p-4 shadow-md rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="w-6 h-6 text-gray-500" />}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
