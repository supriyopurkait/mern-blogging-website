import React, { useEffect, useState } from "react";
import Animationrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
const HomePage = () => {
  let [blogData, setBlogData] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");
  let catagories = [
    "hiking adventures",
    "nature",
    "biodiversity",
    "tigers",
    "mountait",
    "finance",
    "games",
    "travel tips",
    "wanderlust",
    "open road",
    "flower",
    "natural ornament",
  ];
  const fetchLatestBlogs = ({page = 1}) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/latest-blogs",{page})
      .then(async ({ data }) => {
        let formatData = await filterPaginationData({
          state: blogData,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blog-count"
        })
        console.log(formatData);
        setBlogData(formatData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
        
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchBlogsByCategory = ({ page = 1}) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/search-blogs", {
        tag: pageState,page
      })
      .then(async({ data }) => {
        let formatData = await filterPaginationData({
          state: blogData,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: {tag: pageState }
        })
        setBlogData(formatData);
        setTrendingBlogs(data.blogs)
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const loadBlogBycategory = (e) => {
    let categoryValue = e.target.innerText.toLowerCase();
    setBlogData(null);
    if (pageState == categoryValue) {
      setPageState("home");
      return;
    }
    setPageState(categoryValue);
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState == "home") {
      fetchLatestBlogs({page: 1});
    } else {
      fetchBlogsByCategory({page: 1});
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);
  return (
    <Animationrapper>
      <section className="h-hover flex justify-center gap-10">
        <div className=" w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogData == null ? (
                <Loader />
              ) : !blogData.results.length ? (
                <NoDataMessage message="No blog published with this tag till now" />
              ) : (
                blogData.results.map((blog, i) => {
                  return (
                    <Animationrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </Animationrapper>
                  );
                })
              )}
              <LoadMoreDataBtn state={blogData} fetchDataFun = {(pageState == "home"? fetchLatestBlogs: fetchBlogsByCategory)}/>
            </>
            {trendingBlogs == null ? (
              <Loader />
            ) : !trendingBlogs.length ? (
              <NoDataMessage message="No trending blog" />
            ) : (
              trendingBlogs.map((trendingBlog, i) => {
                return (
                  <Animationrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={trendingBlog} index={i} />
                  </Animationrapper>
                );
              })
            )}
          </InPageNavigation>

          {/* latest comments */}
        </div>
        <div className="min-w-[40%] lg:min-w-[400px] mx-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
          {/* filters and treding blogs */}

          <div className="flex flex-col gap-10">
            <div className="h">
              <h1 className="font-medium text-xl mb-8">
                stories of all interests
              </h1>
              <div className="flex gap-3 flex-wrap ">
                {catagories.map((category, i) => {
                  return (
                    <button
                      onClick={loadBlogBycategory}
                      className={
                        "tag " +
                        (pageState == category ? " bg-black text-white " : " ")
                      }
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <h1 className="font-medium text-xl mt-8 mb-8 flex gap-1">
                trending
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b6666"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-trending-up"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </h1>
              {trendingBlogs == null ? (
                <Loader />
              ) : !trendingBlogs.length ? (
                <NoDataMessage message="No trending blog" />
              ) : (
                trendingBlogs.map((trendingBlog, i) => {
                  return (
                    <Animationrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={trendingBlog} index={i} />
                    </Animationrapper>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </Animationrapper>
  );
};

export default HomePage;
