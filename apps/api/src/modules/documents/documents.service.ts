import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type UploadedDocumentFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
};

function cleanType(value: string | undefined) {
  const type = value?.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  if (!type) throw new BadRequestException("Document type is required.");
  return type;
}

function requireFile(file: UploadedDocumentFile | undefined) {
  if (!file) throw new BadRequestException("Document file is required.");
  return file;
}

function fileUrl(file: UploadedDocumentFile) {
  return `/uploads/documents/${file.filename}`;
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  studentDocuments(studentId: string) {
    return this.prisma.document.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" }
    });
  }

  async uploadStudentDocument(studentId: string, typeValue: string | undefined, uploaded: UploadedDocumentFile | undefined) {
    const student = await this.prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException("Student profile not found.");

    const type = cleanType(typeValue);
    const file = requireFile(uploaded);
    const document = await this.prisma.document.create({
      data: {
        studentId,
        type,
        fileUrl: fileUrl(file),
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size
      }
    });

    if (type === "PHOTO") {
      await this.prisma.studentProfile.update({ where: { id: studentId }, data: { photoUrl: document.fileUrl } });
    }
    if (type === "SIGNATURE") {
      await this.prisma.studentProfile.update({ where: { id: studentId }, data: { signatureUrl: document.fileUrl } });
    }

    return document;
  }

  staffDocuments(staffId: string) {
    return this.prisma.document.findMany({
      where: { staffId },
      orderBy: { createdAt: "desc" }
    });
  }

  async uploadStaffDocument(staffId: string, typeValue: string | undefined, uploaded: UploadedDocumentFile | undefined) {
    const staff = await this.prisma.staffProfile.findUnique({ where: { id: staffId } });
    if (!staff) throw new NotFoundException("Staff profile not found.");

    const type = cleanType(typeValue);
    const file = requireFile(uploaded);
    const document = await this.prisma.document.create({
      data: {
        staffId,
        type,
        fileUrl: fileUrl(file),
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size
      }
    });

    if (type === "PHOTO") {
      await this.prisma.staffProfile.update({ where: { id: staffId }, data: { photoUrl: document.fileUrl } });
    }
    if (type === "SIGNATURE") {
      await this.prisma.staffProfile.update({ where: { id: staffId }, data: { signatureUrl: document.fileUrl } });
    }
    if (type === "THUMB") {
      await this.prisma.staffProfile.update({ where: { id: staffId }, data: { thumbUrl: document.fileUrl } });
    }

    return document;
  }

  rtoCaseDocuments(rtoCaseId: string) {
    return this.prisma.document.findMany({
      where: { rtoCaseId },
      orderBy: { createdAt: "desc" }
    });
  }

  async uploadRtoCaseDocument(rtoCaseId: string, typeValue: string | undefined, uploaded: UploadedDocumentFile | undefined) {
    const rtoCase = await this.prisma.rtoCase.findUnique({ where: { id: rtoCaseId } });
    if (!rtoCase) throw new NotFoundException("RTO case not found.");

    const type = cleanType(typeValue);
    const file = requireFile(uploaded);
    return this.prisma.document.create({
      data: {
        rtoCaseId,
        type,
        fileUrl: fileUrl(file),
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size
      }
    });
  }
}
