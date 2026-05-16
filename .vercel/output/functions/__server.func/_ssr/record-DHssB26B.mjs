import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { C as LoaderCircle, M as Check, P as Camera, h as RefreshCw, n as X, o as Upload } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/record-DHssB26B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RecordPage() {
	const navigate = useNavigate();
	const [selectedFile, setSelectedFile] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [isUploading, setIsUploading] = (0, import_react.useState)(false);
	const [isCameraActive, setIsCameraActive] = (0, import_react.useState)(false);
	const [isRecording, setIsRecording] = (0, import_react.useState)(false);
	const videoPreviewRef = (0, import_react.useRef)(null);
	const mediaRecorderRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		return () => {
			if (videoPreviewRef.current?.srcObject) videoPreviewRef.current.srcObject.getTracks().forEach((track) => track.stop());
		};
	}, []);
	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { aspectRatio: 9 / 16 },
				audio: true
			});
			setIsCameraActive(true);
			if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
		} catch (err) {
			toast.error("Camera access denied. Please check permissions.");
		}
	};
	const startRecording = () => {
		if (!videoPreviewRef.current?.srcObject) return;
		const chunks = [];
		const stream = videoPreviewRef.current.srcObject;
		const supportedType = [
			"video/webm;codecs=vp9",
			"video/webm",
			"video/mp4"
		].find((type) => MediaRecorder.isTypeSupported(type)) || "";
		const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedType });
		mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) chunks.push(e.data);
		};
		mediaRecorder.onstop = () => {
			const blob = new Blob(chunks, { type: supportedType });
			const extension = supportedType.includes("mp4") ? "mp4" : "webm";
			setSelectedFile(new File([blob], `zuzu-capture-${Date.now()}.${extension}`, { type: supportedType }));
			setPreviewUrl(URL.createObjectURL(blob));
			stream.getTracks().forEach((track) => track.stop());
			setIsCameraActive(false);
		};
		mediaRecorderRef.current = mediaRecorder;
		mediaRecorder.start();
		setIsRecording(true);
		toast.success("Recording ZuZu...");
	};
	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};
	const handleFileSelect = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};
	const handleUpload = async () => {
		if (!selectedFile) return;
		setIsUploading(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");
			const fileExt = selectedFile.name.split(".").pop();
			const fileName = `${Math.random()}.${fileExt}`;
			const filePath = `${user.id}/${fileName}`;
			const { error: uploadError } = await supabase.storage.from("shout-videos").upload(filePath, selectedFile);
			if (uploadError) throw uploadError;
			const { data: { publicUrl } } = supabase.storage.from("shout-videos").getPublicUrl(filePath);
			const { error: dbError } = await supabase.from("shouts").insert([{
				user_id: user.id,
				video_url: publicUrl,
				caption,
				is_approved: false
			}]);
			if (dbError) throw dbError;
			toast.success("ZuZu sent for approval! ✨");
			navigate({ to: "/feed" });
		} catch (err) {
			toast.error(err.message);
		} finally {
			setIsUploading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[430px] h-full max-h-[932px] bg-zinc-950 flex flex-col relative shadow-2xl border-x border-white/5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "p-6 flex justify-between items-center z-50 shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							if (isCameraActive) {
								(videoPreviewRef.current?.srcObject)?.getTracks().forEach((t) => t.stop());
								setIsCameraActive(false);
							} else navigate({ to: "/feed" });
						},
						className: "p-2 bg-white/10 rounded-full active:scale-90 transition-transform",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-black italic uppercase tracking-tighter text-lg text-emerald-400",
						children: "New ZuZu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 flex flex-col px-6 pb-6 overflow-y-auto no-scrollbar",
				children: !previewUrl && !isCameraActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-300",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: () => document.getElementById("file-upload")?.click(),
							className: "w-full aspect-[9/16] border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer active:scale-95 transition-all hover:bg-white/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
								size: 48,
								className: "text-white/20"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-black uppercase tracking-[0.2em] text-white/30",
								children: "From Gallery"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							id: "file-upload",
							hidden: true,
							accept: "video/*",
							onChange: handleFileSelect
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: startCamera,
							className: "w-full bg-white text-black py-5 rounded-2xl font-black italic uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { size: 18 }), " Use Camera"]
						})
					]
				}) : isCameraActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full aspect-[9/16] rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoPreviewRef,
						autoPlay: true,
						playsInline: true,
						muted: true,
						className: "w-full h-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute bottom-10 left-0 w-full flex flex-col items-center gap-4",
						children: [isRecording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: stopRecording,
							className: "w-16 h-16 bg-red-600 rounded-full border-4 border-white flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.5)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-5 h-5 bg-white rounded-sm" })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: startRecording,
							className: "w-16 h-16 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center active:scale-90 transition-transform",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-10 bg-red-600 rounded-full" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[9px] font-black uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm",
							children: isRecording ? "Recording ZuZu..." : "Tap to Film"
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 animate-in slide-in-from-bottom-10 duration-500 pb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-[9/16] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-900 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: previewUrl,
								autoPlay: true,
								loop: true,
								muted: true,
								className: "w-full h-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setPreviewUrl(null);
									setSelectedFile(null);
								},
								className: "absolute top-4 right-4 p-2 bg-black/50 rounded-full backdrop-blur-md active:rotate-180 transition-transform duration-500",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								placeholder: "Caption your ZuZu...",
								value: caption,
								onChange: (e) => setCaption(e.target.value),
								className: "w-full bg-transparent outline-none text-xs font-medium placeholder:text-white/20 resize-none h-16"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: isUploading,
							onClick: handleUpload,
							className: "w-full bg-emerald-500 text-black py-4 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg shrink-0",
							children: [isUploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 18 }), isUploading ? "Uploading..." : "Post ZuZu"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[8px] font-bold text-center text-white/30 uppercase tracking-widest",
							children: "ZuZuShout Safe Space: your parent must approve this post"
						})
					]
				})
			})]
		})
	});
}
//#endregion
export { RecordPage as component };
