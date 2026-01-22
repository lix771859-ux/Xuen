import { FileIcon, Folder, Loader, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { v4 } from "uuid";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/utils/supabase/client";
import Loading from "./Loading";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

type Props = {
  apiEndpoint: "agencyLogo" | "avatar" | "subaccountLogo";
  onChange: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const client = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const convertURLtoFile = async (url: string) => {
      try {
        const response = await fetch(url);
        const data = await response.blob();
        const filename = url.split("/").pop() || "downloaded";
        const metadata = { type: data.type };
        const file = new File([data], filename, metadata);
        setFile(file);
        setFilePath(url); // Speichere die URL als filePath
      } catch (error) {
        console.error("Error converting URL to File:", error);
      }
    };

    if (value) {
      convertURLtoFile(value);
    } else {
      setFilePath(null); // Setze filePath zurück, wenn kein value vorhanden ist
    }
  }, [value]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    setFilePath(URL.createObjectURL(file)); // Erstelle einen lokalen Pfad für die Vorschau
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
      // Word 文档
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      // Excel 表格
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      // PowerPoint 演示文稿
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      // 文本文件
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  const handleButtonClick = async (e: any) => {
    if (isUploading) return;

    if (file) {
      e.stopPropagation();
      console.log("upload file");
      setIsUploading(true);
      console.log(isUploading);
      await uploadFile();
      setIsUploading(false);
      console.log(isUploading);
    } else {
      console.log("select file");
      fileInputRef.current?.click();
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    const bucketName = "customer-profiles"; // 改成你实际的 bucket 名称
    
    // Erstelle eine eindeutige Dateiname für das Hochladen
    const fileName = `${apiEndpoint}/${v4()}.${file.type.split("/").pop()}`;

    try {
      // 检查用户是否已登录
      const { data: { user }, error: authError } = await client.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "未登录",
          description: "请先登录再上传文件",
          variant: "destructive",
        });
        console.error("用户未登录:", authError);
        return;
      }
      
      console.log("当前用户:", user.email);

      // Lade die Datei zum Supabase Bucket hoch
      const { data, error } = await client.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true, // true ermöglicht es, existierende Dateien zu überschreiben
        });

      if (error) {
        console.error("上传错误详情:", error);
        throw error;
      }

      // Wenn der Upload erfolgreich war, generiere eine URL zur Datei
      const {
        data: { publicUrl },
      } = client.storage.from(bucketName).getPublicUrl(data.path);

      if (!publicUrl) {
        toast({
          title: "错误",
          description: "无法获取文件 URL",
          variant: "destructive",
        });
        return;
      }

      console.log("Datei erfolgreich hochgeladen: ", publicUrl);

      setFilePath(publicUrl);
      onChange(publicUrl);
      
      // 成功提示
      toast({
        title: "上传成功",
        description: "文件已成功上传到云端存储，即将跳转到支付页面...",
      });
      
      // 延迟1秒后跳转到支付页面
      setTimeout(() => {
        router.push('/payment');
      }, 1000);
    } catch (error: any) {
      console.error("Fehler beim Hochladen der Datei: ", error.message);
      toast({
        title: "上传失败",
        description: error.message || "文件上传时发生错误",
        variant: "destructive",
      });
    }
  };

  const removeFile = (e: any) => {
    e.stopPropagation();
    setFile(null);
    setFilePath(null);
    onChange(""); // Informiere den übergeordneten Zustand, dass keine Datei ausgewählt ist
  };

  const renderFilePreview = () => {
    if (!file) return null;

    const type = file.type.split("/").pop();
    if (type !== "pdf") {
      return (
        <div className="relative w-40 h-40">
          <Image
            src={filePath || ""}
            alt="uploaded image"
            className="object-contain"
            fill
          />
        </div>
      );
    } else {
      return (
        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
          <FileIcon />
          <a
            href={filePath || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
          >
            View PDF
          </a>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className="w-full flex flex-col items-center p-10 bg-muted/30 border-2 border-dashed border-gray-300 cursor-pointer"
      >
        <input {...getInputProps()} />

        {file && (
          <>
            {renderFilePreview()}
            <Button onClick={removeFile} variant="ghost" type="button">
              <X className="h-4 w-4" />
              Remove Logo
            </Button>
          </>
        )}

        <Button onClick={handleButtonClick} type="button" className="mt-4">
          {isUploading ? (
            <Loading />
          ) : file ? (
            <p className="flex justify-center items-center">
              <UploadCloud className="h-4 w-4 mr-2 " />
              Upload Logo
            </p>
          ) : (
            <p className="flex justify-center items-center">
              <Folder className="h-4 w-4 mr-2 " />
              Select File
            </p>
          )}
        </Button>
        <div className="text-muted-foreground pt-5 text-sm">
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag &apos;n drop some files here, or click to select files</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
