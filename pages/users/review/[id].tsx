import Button from "@components/button";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import { Product, Review, User } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

interface UserWithOther extends User {
  products: Product[];
  receivedReviews: Review[];
}

interface Profile {
  ok: boolean;
  user: UserWithOther;
}

interface CheckNum {
  num: number;
  isHover: boolean;
}

interface WriteForm {
  review: string;
}

interface ReviewResponse {
  ok: boolean;
}

const UserReview: NextPage = () => {
  const [score, setScore] = useState<CheckNum>({ num: 0, isHover: false });
  const [value, setValue] = useState(0);
  const router = useRouter();
  const { data } = useSWR<Profile>(`/api/users/profile/${router?.query?.id}`);
  const { register, handleSubmit } = useForm<WriteForm>();
  const [setReview, { loading, data: reviewData }] =
    useMutation<ReviewResponse>(`/api/users/review/${router?.query?.id}`);
  const onMouseEnter = (num: number) => {
    setScore({ num, isHover: true });
  };

  const onClick = (num: number) => {
    setValue(num);
  };

  const onValid = (data: WriteForm) => {
    if (loading) return;
    setReview({ ...data, value });
  };

  useEffect(() => {
    if (reviewData && reviewData.ok) {
      router.replace("/");
    }
  }, [reviewData, router]);
  return (
    <Layout
      seoTitle={`For ${data?.user?.name} review`}
      title={`For ${data?.user?.name} review`}
      canGoBack
    >
      <div className="relative mb-6">
        <div
          className="absolute right-8"
          onMouseLeave={() => setScore({ num: 0, isHover: false })}
        >
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                onClick={() => onClick(star)}
                onMouseEnter={() => onMouseEnter(star)}
                className={cls(
                  "h-5 w-5 text-gray-400 cursor-pointer",
                  score.isHover
                    ? star <= score.num
                      ? "text-yellow-400"
                      : "text-gray-400"
                    : star <= value
                    ? "text-yellow-400"
                    : "text-gray-400"
                )}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onValid)} className="px-6 flex flex-col">
        <TextArea
          register={register("review", { required: true, minLength: 5 })}
          required
          placeholder="Please, Write your review!"
        />
        <Button text={loading ? "Loading..." : "Review"} />
      </form>
    </Layout>
  );
};

export default UserReview;
