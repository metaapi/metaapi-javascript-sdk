import './section.css';

interface ISectionsProps {
  children: React.ReactNode
  modifier?: string
}
export function Sections({
  children,
  modifier
}: ISectionsProps) {
  return (
    <div className={`sections ${(modifier && `sections--${modifier}}`) || ''}`}>
      {children}
    </div>
  );
}

interface ISectionProps {
  children: React.ReactNode
  modifier?: string
}
export function Section({
  children,
  modifier
}: ISectionProps) {
  return (
    <div className={`section ${(modifier && `section--${modifier} ${modifier}`) || ''}`}>
      {children}
    </div>
  );
}