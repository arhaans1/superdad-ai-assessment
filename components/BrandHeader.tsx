import Image from "next/image";

export function BrandHeader() {
  return (
    <header className="brand-header">
      <div className="brand-header-inner">
        <Image
          className="brand-logo"
          src="/platform-of-papas-logo.png"
          alt="Platform of Papas"
          width={320}
          height={320}
          priority
        />
        <div className="brand-text">
          <div className="brand-kicker">Platform of Papas</div>
          <div className="helper-text">Connected Father. Confident At Work.</div>
        </div>
      </div>
    </header>
  );
}
