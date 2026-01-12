import Image from 'next/image'
import Link from 'next/link'

interface AuthorBoxProps {
  name?: string
  slug?: string
  image?: string
  bio?: string
  credentials?: string
}

export default function AuthorBox({
  name,
  slug,
  image,
  bio,
  credentials,
}: AuthorBoxProps) {
  // Safety check - don't render if no name
  if (!name) return null;

  const AuthorContent = () => (
    <div className="flex items-start gap-5">
      {/* Author Image */}
      <div className="flex-shrink-0">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={72}
            height={72}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl font-serif text-gray-500">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Author Info */}
      <div className="flex-grow">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Written by</p>
        <h4 className="font-serif text-xl text-black mb-1">{name}</h4>
        {credentials && (
          <p className="text-sm text-[#C9A227] mb-2">{credentials}</p>
        )}
        {bio && (
          <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="border-t border-b border-gray-200 py-8 my-10">
      {slug ? (
        <Link href={`/author/${slug}`} className="block hover:opacity-80 transition-opacity">
          <AuthorContent />
        </Link>
      ) : (
        <AuthorContent />
      )}
    </div>
  )
}