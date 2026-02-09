import Container from "./Container";
export default function Section({ children, className="" }: {children: React.ReactNode; className?: string}) {
  return <section className={className}><Container>{children}</Container></section>;
}
