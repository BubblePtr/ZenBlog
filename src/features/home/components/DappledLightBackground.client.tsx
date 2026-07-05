export default function DappledLightBackground() {
  return (
    <div className="dappled-light" aria-hidden="true">
      <svg className="dappled-light__defs" aria-hidden="true">
        <defs>
          <filter id="home-dappled-light-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011"
              numOctaves="4"
              seed="8"
              result="noise"
            />
            <feComponentTransfer in="noise" result="threshold">
              <feFuncA type="discrete" tableValues="0 0 0 1 1 1 0 0 0 1 1 0" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.97
                      0 0 0 0 0.89
                      0 0 0 0 0.70
                      0 0 0 0.32 0"
              in="blur"
            />
          </filter>
        </defs>
      </svg>

      <div className="dappled-light__layer dappled-light__layer--filter" />
      <div className="dappled-light__layer dappled-light__layer--warmth" />
      <div className="dappled-light__fade" />
    </div>
  );
}
