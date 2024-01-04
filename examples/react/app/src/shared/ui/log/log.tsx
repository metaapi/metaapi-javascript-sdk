import './log.css';

export interface IPrintLogProps {
  items: unknown[]
}

export function PrintLog({
  items
}: IPrintLogProps) {
  return (
    <div className="logs">
      {items.map((log, index) => {
        return (
          <div key={index} className="logs__item log">
            { typeof log  === 'string' ? log : JSON.stringify(log, null, 2) }
          </div>
        );
      })}
    </div>
  );
} 
