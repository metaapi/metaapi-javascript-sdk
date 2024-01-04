import './form.css';

import React from 'react';
import { IFieldProps } from './form.field';

interface IFormProps {
  children: React.ReactNode

  onSubmit: () => void
  onReset?: () => void

  disabled?: boolean
  done?: boolean
}

export function Form({
  children,

  onSubmit,
  onReset,
  
  disabled,
  done,
}: IFormProps) {

  const rFields = React.Children.map(children, (child: React.ReactNode) => {
    if (React.isValidElement<IFieldProps>(child) && child.props.disabled === undefined)
    {return React.cloneElement<IFieldProps>(child, { disabled });}
    return child;
  });

  return (
    <div className="form">
      { rFields }
      
      <div className="buttons">
        <button 
          className={`button ${disabled? 'button--disactive' : 'button--active'}`} 
          onClick={() => onSubmit()}
          disabled={disabled}
        >
          {disabled? (done === undefined? 'Connect' : (done? 'Connected' : 'Connecting...')) : 'Connect'}
        </button>

        { done && onReset && 
          <button
            className="button button--reset"
            onClick={() => onReset()}
          >
            Clear & Reset
          </button>
        } 
      </div>
    </div>
  );
}