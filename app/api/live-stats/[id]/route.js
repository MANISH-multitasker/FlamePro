// import { NextResponse } from "next/server";

// export async function GET(_, { params }) {
//   const { videoId } = params;

//   try {
//     const res = await fetch(
//       "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "User-Agent": "Mozilla/5.0",
//         },
//         body: JSON.stringify({
//           context: {
//             client: {
//               clientName: "WEB",
//               clientVersion: "2.20240215.01.00",
//             },
//           },
//           videoId,
//         }),
//       }
//     );

//     const data = await res.json();
//     const details = data?.videoDetails || {};

//     const viewers = Number(details.viewCount || 0);
//     const likes = Number(details.likeCount || 0);

//     return NextResponse.json({
//       viewers,
//       likes,
//     });
//   } catch (err) {
//     console.error("Stats scrape error:", err);
//     return NextResponse.json({ viewers: 0, likes: 0 });
//   }
// }
