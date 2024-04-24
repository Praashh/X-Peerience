/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import ExperienceCard from "../ui/experience-card";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FeedHero() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    async function getPosts() {
      const res = await axios.get("http://localhost:3001/api/v1/post/all");
      console.log(res.data.posts);
      setPosts(res.data.posts);
    }
    getPosts();
  });
  return (
    <>
      <div className=" py-6 w-full mt-14">
        <div className="px-4 flex flex-col gap-2 md:gap-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Interview Experiences
            </h1>
            <p className="text-gray-500 md:text-xl/relaxed">
              Prepare for your next interview with insights from others who have
              been there.
            </p>
          </div>
          <div className="mx-auto max-w-sm">
            <div className="relative">
              <Input
                className="pl-10"
                placeholder="Search for a company or job title..."
                type="search"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container grid max-w-7xl items-start gap-6 px-4 py-8 md:grid-cols-2 md:py-16 lg:gap-10 lg:px-6 xl:gap-12">
        {posts.map((post: any) => (
          <ExperienceCard
            key={post.id}
            heading={post.title}
            description={post.content}
          />
        ))}
      </div>
    </>
  );
}
