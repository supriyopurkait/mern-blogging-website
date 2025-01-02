import { Link } from "react-router-dom";
import logo from "../imgs/dblog.webp";
import Animationrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import getImgURL from "../common/aws";
import { useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditoContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
const BlogEditor = () => {
  const [imgURL, setImgURL] = useState(null);
  let {
    blog,
    blog: { title, banner, content, tages, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditoContext);
  // console.log(blog);

  //ossum part + portion
  useEffect(() => {
    setTextEditor(
      new EditorJS({
        holderId: textEditorForm,
        data: "",
        tools: tools,
        placeholder: "Let's write an awesome story",
      })
    );
  }, []);
  const handelBannerUpload = async (e) => {
    try {
      let loadingToast = toast.loading("Uploading..");
      console.log(e);
      let img = e.target.files[0];
      // console.log(img);

      let dataIMG = await getImgURL(img);
      toast.dismiss(loadingToast);
      toast.success("Successfully Uploaded");
      setImgURL(dataIMG);
      setBlog({ ...blog, banner: dataIMG });
    } catch (err) {
      toast.dismiss(loadingToast);
      return toast.error(err);
    }

    // console.log(dataIMG, "\nreturned data......");
  };

  const handelTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // console.log(e.keycode);
      e.preventDefault();
    }
  };

  const handelTitleChange = (e) => {
    // console.log(e)
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handelPublishEvent = () => {
    if(!banner.length){
      return toast.error("Upload a blog banner to publish.😘");
    }
    if (!title.length) {
      return toast.error("Write a blog title to publish.😊");
    }
    if (textEditor.isReady) {
      textEditor.save().then((data) => {
        if (data.blocks.length) {
          setBlog({ ...blog, content: data });
          setEditorState("publish");
        }else{
          return toast.error("Write a something.\n we like to know you😊");
        }
      }).catch((err)=>{
        console.log(err);
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10 ">
          <img src={logo} />
        </Link>
        <p className="max-md:hidden text-black line-clamp-3 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-2 ml-auto">
          <button className="btn-dark py-2" onClick={handelPublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>
      <Toaster />
      <Animationrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video bg-white border-2 border-grey hover: opacity-80 ">
              <label htmlFor="uploadBanner">
                <img
                  src={imgURL == null ? defaultBanner : imgURL}
                  className="z-20"
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handelBannerUpload}
                />
              </label>
            </div>
            <textarea
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none my-10 leading-tight placeholder:opacity-40 text-center"
              onKeyDown={handelTitleKeyDown}
              onChange={handelTitleChange}
              name=""
              id=""
            ></textarea>

            <hr className="w-full opacity-10 my-5" />
            <div id="textEditorForm" className="font-gelasio"></div>
          </div>
        </section>
      </Animationrapper>
    </>
  );
};
export default BlogEditor;
