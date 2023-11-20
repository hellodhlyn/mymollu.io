export default function MultilineText({ texts, className }: { texts: string[], className: string }) {
  return (
    <div className={`${className} flex flex-col md:flex-row`}>
      {texts.map((text, index) => (
        <div key={text}>
          <span key={`${texts.join("")}-${text}`}>
            {text}
          </span>
          {(index === texts.length - 1) || <span className="hidden md:inline">&nbsp;-&nbsp;</span>}
        </div>
      ))}
    </div>
  )
}
