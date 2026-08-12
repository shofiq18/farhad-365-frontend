"use client";

import Link from "next/link";
import { Loader, BookOpen, ArrowRight } from "lucide-react";
import { useGetBlogsQuery } from "@/redux/api/blog/blogApi";

export default function BlogIndexPage() {
  const { data: blogsResponse, isLoading } = useGetBlogsQuery();
  const blogs: any[] = blogsResponse?.data ?? [];

  return (
    <div className="min-h-screen bg-white pb-24 font-sans select-none">
      
      {/* Editorial Header Banner */}
      <div className="relative bg-zinc-950 text-white py-20 md:py-28 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-90 h-90 bg-zinc-700 rounded-full blur-3xl opacity-10 -ml-12 -mb-12"></div>
        
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs md:text-sm font-black uppercase tracking-widest text-[#507c68] mb-3">Pristto Journal</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Stories, Style & Culture
          </h1>
          <p className="text-sm md:text-lg text-zinc-400 mt-4 max-w-xl font-medium leading-relaxed">
            Discover the latest trends, editorial guides, behind-the-scenes designs, and style inspirations straight from the Pristto Team.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 mt-16">
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin h-8 w-8 text-black" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && blogs.length === 0 && (
          <div className="text-center py-20 max-w-md mx-auto">
            <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-lg font-black uppercase text-black">No Articles Yet</h2>
            <p className="text-sm text-zinc-500 mt-2">
              We are working on bringing you the best fashion guides and brand news. Check back soon!
            </p>
          </div>
        )}

        {/* Blog Grid */}
        {!isLoading && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            {blogs.map((blog) => (
              <article key={blog.id || blog._id} className="group flex flex-col space-y-4">
                
                {/* Image Wrap with hover effect */}
                <Link href={`/blog/${blog.slug}`} className="block overflow-hidden bg-zinc-100 aspect-[16/10] relative border border-zinc-200">
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold uppercase tracking-wider text-xs">
                      Pristto
                    </div>
                  )}
                </Link>

                {/* Meta details */}
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span>•</span>
                  <span>{blog.readTime || "5 min read"}</span>
                </div>

                {/* Title */}
                <Link href={`/blog/${blog.slug}`} className="block">
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black leading-tight hover:text-zinc-700 transition duration-200">
                    {blog.title}
                  </h2>
                </Link>

                {/* Excerpt */}
                <p className="text-sm text-zinc-500 leading-relaxed font-medium line-clamp-3">
                  {blog.excerpt}
                </p>

                {/* Read Button */}
                <div className="pt-2">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider border-b-2 border-black pb-1 hover:border-zinc-500 hover:text-zinc-600 transition"
                  >
                    Read Article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
