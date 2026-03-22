const SkeletonGaleri = () => {
  const heights = [
    'h-48',
    'h-64',
    'h-40',
    'h-56',
    'h-72',
    'h-44',
    'h-60',
    'h-48',
    'h-52',
    'h-40',
    'h-68',
    'h-44',
  ]

  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="relative h-[60vh] bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-muted-foreground/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
          <div className="h-5 w-36 rounded-full bg-muted-foreground/20" />
          <div className="h-10 w-72 md:w-96 rounded-xl bg-muted-foreground/20" />
          <div className="h-5 w-64 rounded-lg bg-muted-foreground/15" />
          <div className="h-11 w-40 rounded-full bg-muted-foreground/20 mt-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-muted"
              style={{ width: `${60 + i * 14}px` }}
            />
          ))}
        </div>

        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {heights.map((h, i) => (
            <div key={i} className={`break-inside-avoid w-full ${h} rounded-xl bg-muted`} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkeletonGaleri
