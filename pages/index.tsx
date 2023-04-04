import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useForm } from "react-hook-form";
import { useState } from "react";

import Loading from "@/components/Loading";
import { ResponseData, SuccessResult } from "@/pages/api/links";

const inter = Inter({ subsets: ["latin"] });

type FormFields = {
  url: string;
};

const isSuccessResult = (result?: ResponseData): result is SuccessResult => {
  return !!(result as SuccessResult)?.links;
};

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormFields>();
  const [result, setResult] = useState<ResponseData>();
  const [error, setError] = useState("");

  async function onSubmit(values: FormFields) {
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        body: JSON.stringify(values),
      });
      if (response.ok) {
        const data: ResponseData = await response.json();
        setError("");
        setResult(data);
      } else {
        throw new Error("Something went wrong.");
      }
    } catch (err) {
      setResult(undefined);
      setError(String(err));
      console.error(err);
    }
  }

  return (
    <>
      <Head>
        <title>Web crawler</title>
        <meta
          name="description"
          content="This app finds all link by given url"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={inter.className}>Web crawler</h1>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <input
            required
            className={styles.field}
            placeholder="http://"
            {...register("url")}
          />
          <button className={styles.submitButton} disabled={isSubmitting}>
            Find links
            {isSubmitting ? (
              <>
                {" "}
                <Loading />
              </>
            ) : null}
          </button>
        </form>

        {error && <p>Error: {error}</p>}

        {isSuccessResult(result) && (
          <>
            <h3 className={inter.className}>
              We found {result?.links.length} links (crawling time:{" "}
              {result?.crawlTime.toFixed(2)} ms):
            </h3>
            <div className={styles.result}>
              {result?.links?.map((link) => (
                <div key={link} className={styles.resultLink}>
                  <a className={inter.className} href={link}>
                    {link}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
