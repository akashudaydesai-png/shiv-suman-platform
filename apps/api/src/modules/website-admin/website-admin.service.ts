import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class WebsiteAdminService {
  constructor(private readonly prisma: PrismaService) {}

  blogs() {
    return this.prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" }
    });
  }

  async createBlog(body: Record<string, unknown>) {
    const title = text(body.title);
    if (!title) throw new BadRequestException("Blog title is required.");
    const slug = text(body.slug, slugify(title));
    if (!slug) throw new BadRequestException("Blog slug is required.");

    return this.prisma.blogPost.create({
      data: {
        title,
        slug,
        seoTitle: text(body.seoTitle) || null,
        metaDescription: text(body.metaDescription) || null,
        tags: Array.isArray(body.tags) ? body.tags.map(String).map((item) => item.trim()).filter(Boolean) : [],
        featuredImageUrl: text(body.featuredImageUrl) || null,
        featuredVideoUrl: text(body.featuredVideoUrl) || null,
        redirectUrl: text(body.redirectUrl) || null,
        content: text(body.content),
        publishedAt: body.published ? new Date() : null
      }
    });
  }

  async updateBlog(id: string, body: Record<string, unknown>) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title === undefined ? undefined : text(body.title),
        slug: body.slug === undefined ? undefined : text(body.slug),
        seoTitle: body.seoTitle === undefined ? undefined : text(body.seoTitle) || null,
        metaDescription: body.metaDescription === undefined ? undefined : text(body.metaDescription) || null,
        tags: body.tags === undefined ? undefined : Array.isArray(body.tags) ? body.tags.map(String).map((item) => item.trim()).filter(Boolean) : [],
        featuredImageUrl: body.featuredImageUrl === undefined ? undefined : text(body.featuredImageUrl) || null,
        featuredVideoUrl: body.featuredVideoUrl === undefined ? undefined : text(body.featuredVideoUrl) || null,
        redirectUrl: body.redirectUrl === undefined ? undefined : text(body.redirectUrl) || null,
        content: body.content === undefined ? undefined : text(body.content)
      }
    });
  }

  publishBlog(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data: { publishedAt: new Date() }
    });
  }

  unpublishBlog(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data: { publishedAt: null }
    });
  }

  page(slug: string) {
    return this.prisma.publicWebsitePage.findUnique({
      where: { slug }
    });
  }

  async upsertPage(slug: string, body: Record<string, unknown>) {
    const title = text(body.title, slug === "contact" ? "Contact" : "Website Page");
    const summary = text(body.summary);
    const content = text(body.content);
    return this.prisma.publicWebsitePage.upsert({
      where: { slug },
      update: {
        title,
        seoTitle: text(body.seoTitle) || null,
        metaDescription: text(body.metaDescription) || null,
        contentJson: {
          summary,
          content,
          phone: text(body.phone) || null,
          email: text(body.email) || null,
          whatsapp: text(body.whatsapp) || null,
          address: text(body.address) || null,
          ctaLabel: text(body.ctaLabel) || null,
          ctaUrl: text(body.ctaUrl) || null
        },
        published: body.published === false ? false : true
      },
      create: {
        slug,
        title,
        seoTitle: text(body.seoTitle) || null,
        metaDescription: text(body.metaDescription) || null,
        contentJson: {
          summary,
          content,
          phone: text(body.phone) || null,
          email: text(body.email) || null,
          whatsapp: text(body.whatsapp) || null,
          address: text(body.address) || null,
          ctaLabel: text(body.ctaLabel) || null,
          ctaUrl: text(body.ctaUrl) || null
        },
        published: body.published === false ? false : true
      }
    });
  }
}

