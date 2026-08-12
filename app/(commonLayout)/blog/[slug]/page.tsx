"use client";

import { use } from "react";
import Link from "next/link";
import { Loader, ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { useGetBlogBySlugQuery } from "@/redux/api/blog/blogApi";
import { toast } from "react-hot-toast";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: blogResponse, isLoading, error } = useGetBlogBySlugQuery(slug);
  const blog = blogResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-black uppercase text-black">Article Not Found</h2>
        <p className="text-zinc-500 mt-2">The editorial post you are looking for does not exist or has been moved.</p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>
      </div>
    );
  }

  // Format paragraphs for rendering
  const paragraphs = blog.content.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);

  return (
    <article className="min-h-screen bg-white pb-24 font-sans select-none">
      
      {/* Back button header (sticky / visible floating bar) */}
      <div className="border-b border-zinc-100 bg-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black hover:text-zinc-600 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Journal
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 mt-8 md:mt-12">
        
        {/* Category tag */}
        <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-4">Pristto Journal</p>
        
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black leading-tight">
          {blog.title}
        </h1>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 border-t border-b border-zinc-100 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-400" />
            <span>By {blog.author || "Pristto Team"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span>{blog.readTime || "5 min read"}</span>
          </div>
        </div>

        {/* Hero Cover Image */}
        {blog.coverImage && (
          <div className="mt-8 border border-zinc-200 overflow-hidden bg-zinc-100 aspect-[16/9]">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt Block */}
        <div className="mt-10 p-6 md:p-8 bg-zinc-50 border-l-4 border-[#507c68] text-zinc-700 font-medium text-base md:text-lg italic leading-relaxed">
          "{blog.excerpt}"
        </div>

        {/* Main Article Content Paragraphs */}
        <div className="mt-10 text-zinc-800 text-base md:text-lg leading-relaxed font-medium">
          {paragraphs.map((p: string, idx: number) => (
            <p key={idx} className="mb-6 whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {/* Bottom Footer Actions */}
        <div className="border-t border-zinc-200 mt-16 pt-8 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black hover:text-zinc-600 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all articles
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: blog.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Article link copied!");
              }
            }}
            className="text-xs font-black uppercase tracking-wider border border-zinc-300 px-5 py-2.5 hover:bg-zinc-50 transition cursor-pointer"
          >
            Share Article
          </button>
        </div>

      </div>
    </article>
  );
}
