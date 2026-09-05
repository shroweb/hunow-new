export const INDEXNOW_KEY = "e4b3c9f8a12d45e7b8c9d0e1f2a3b4c5";
export const INDEXNOW_HOST = "www.hunow.co.uk";

export async function submitUrlsToIndexNow(urlList: string[]) {
  if (!urlList.length) return { success: true, count: 0 };
  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urlList.slice(0, 10000),
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return {
      success: res.ok,
      status: res.status,
      count: urlList.length,
    };
  } catch (err) {
    return { success: false, error: String(err), count: urlList.length };
  }
}
