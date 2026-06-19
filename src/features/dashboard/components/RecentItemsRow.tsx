"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Tag } from "lucide-react";
import { cn } from "@/utils/cn";
import { capitalise, formatRelative } from "@/utils/formatters";
import type { WardrobeItem } from "@/types";

interface RecentItemsRowProps {
  items:    WardrobeItem[];
  onUpload: () => void;
}

export function RecentItemsRow({ items, onUpload }: RecentItemsRowProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">
          Recently Added
        </h2>
        <Link href="/closet" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add new button */}
        <button
          onClick={onUpload}
          className="flex-shrink-0 w-24 aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center gap-2 text-foreground-faint hover:text-accent transition-all group"
        >
          <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium">Add</span>
        </button>

        {items.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-4">
            <p className="text-sm text-foreground-faint">
              Your recent items will appear here
            </p>
          </div>
        ) : (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 w-24 group"
            >
              <Link href={`/closet/${item.id}`}>
                <div className="relative w-24 aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border mb-2">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name ?? item.category ?? "Item"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="96px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground-faint">
                      <Tag className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-1 leading-snug">
                  {item.name ?? capitalise(item.category ?? "Item")}
                </p>
                <p className="text-[10px] text-foreground-faint mt-0.5">
                  {formatRelative(item.createdAt)}
                </p>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
