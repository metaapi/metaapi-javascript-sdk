import './toggler.css';

interface ITogglerProps {
  activeItem?: string
  className?: string

  onClickHandler: (value: string) => void
  items: string[]
  name: string
}

export function Toggler({
  activeItem,
  className,

  onClickHandler,
  items,
  name
}: ITogglerProps) {
  return (
    <div className={['toggler', className || ''].join(' ')}>
      <div className="toggler__title">{name}</div>

      <div className="toggler__list">
        {items.map(item => 
          <button key={item} 
            onClick={() => onClickHandler(item)}
            className={`toggler__button + ${activeItem === item? ' toggler__button--active' : ''}`}
          >
            {item}
          </button>
        )}
      </div>
    </div>
  );
}