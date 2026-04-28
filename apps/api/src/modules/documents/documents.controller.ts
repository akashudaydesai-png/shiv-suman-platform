import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { existsSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { AuthGuard } from "../auth/auth.guard";
import { DocumentsService } from "./documents.service";

const { diskStorage } = require("multer");

type UploadedDocumentFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
};

type MulterFileInput = { originalname: string };
type MulterCallback = (error: Error | null, value: string) => void;

const uploadRoot = join(process.cwd(), "uploads", "documents");

function ensureUploadFolder() {
  if (!existsSync(uploadRoot)) mkdirSync(uploadRoot, { recursive: true });
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-").slice(0, 80);
}

const storage = diskStorage({
  destination: (_request: unknown, _file: unknown, callback: MulterCallback) => {
    ensureUploadFolder();
    callback(null, uploadRoot);
  },
  filename: (_request: unknown, file: MulterFileInput, callback: MulterCallback) => {
    const extension = extname(file.originalname);
    const base = safeName(file.originalname.replace(extension, "")) || "document";
    callback(null, `${Date.now()}-${base}${extension.toLowerCase()}`);
  }
});

@ApiTags("documents")
@Controller("documents")
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get("student/:studentId")
  studentDocuments(@Param("studentId") studentId: string) {
    return this.documentsService.studentDocuments(studentId);
  }

  @Post("student/:studentId")
  @UseInterceptors(FileInterceptor("file", { storage }))
  uploadStudentDocument(
    @Param("studentId") studentId: string,
    @Body("type") type: string,
    @UploadedFile() file: UploadedDocumentFile
  ) {
    return this.documentsService.uploadStudentDocument(studentId, type, file);
  }

  @Get("staff/:staffId")
  staffDocuments(@Param("staffId") staffId: string) {
    return this.documentsService.staffDocuments(staffId);
  }

  @Post("staff/:staffId")
  @UseInterceptors(FileInterceptor("file", { storage }))
  uploadStaffDocument(
    @Param("staffId") staffId: string,
    @Body("type") type: string,
    @UploadedFile() file: UploadedDocumentFile
  ) {
    return this.documentsService.uploadStaffDocument(staffId, type, file);
  }

  @Get("rto-case/:rtoCaseId")
  rtoCaseDocuments(@Param("rtoCaseId") rtoCaseId: string) {
    return this.documentsService.rtoCaseDocuments(rtoCaseId);
  }

  @Post("rto-case/:rtoCaseId")
  @UseInterceptors(FileInterceptor("file", { storage }))
  uploadRtoCaseDocument(
    @Param("rtoCaseId") rtoCaseId: string,
    @Body("type") type: string,
    @UploadedFile() file: UploadedDocumentFile
  ) {
    return this.documentsService.uploadRtoCaseDocument(rtoCaseId, type, file);
  }
}
