import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: buildBlogLink(post.id),
		})),
	});
}

function buildBlogLink(id) {
	const cleanId = id.replace(/\.[^/.]+$/, '');

	if (cleanId.startsWith('zh/')) {
		return `/zh/blog/${cleanId.slice(3)}/`;
	}

	if (cleanId.startsWith('en/')) {
		return `/blog/${cleanId.slice(3)}/`;
	}

	return `/blog/${cleanId}/`;
}
