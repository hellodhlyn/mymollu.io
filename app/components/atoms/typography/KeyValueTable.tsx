type KeyValueTableProps = {
  items: {
    key: string;
    value: string | React.ReactNode;
  }[];
  keyPrefix: string;
};

export default function KeyValueTable({ items, keyPrefix }: KeyValueTableProps) {
  return (
    <div className="flex mt-4 mb-2 text-sm">
      <div className="mr-4 text-neutral-500">
        {items.map(({ key }) => <p key={`${keyPrefix}-key-${key}`}>{key}</p>)}
      </div>
      <div className="text-neutral-700">
        {items.map(({ key, value }) => {
          if (typeof value === "string") {
            return <p key={`${keyPrefix}-value-${key}`}>{value}</p>;
          } else {
            return <div key={`${keyPrefix}-value-${key}`}>{value}</div>;
          }
        })}
      </div>
    </div>
  )
}
