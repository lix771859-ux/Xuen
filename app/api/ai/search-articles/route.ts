import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 模拟数据作为降级方案
const getMockArticles = (query: string) => {
  if (query.includes('前端') || query.includes('JavaScript') || query.includes('React')) {
    return [
      { title: `${query}的核心概念`, description: `深入理解${query}的基本原理和核心思想` },
      { title: `${query}实战项目`, description: `通过实战项目学习${query}的应用` },
      { title: `${query}进阶技巧`, description: `掌握${query}的高级技巧和优化方法` },
    ];
  } else if (query.includes('后端') || query.includes('数据库')) {
    return [
      { title: `${query}架构设计`, description: `${query}系统的架构设计和最佳实践` },
      { title: `${query}性能优化`, description: `提升${query}系统性能的方法和技巧` },
      { title: `${query}安全指南`, description: `${query}开发中的安全注意事项` },
    ];
  } else {
    return [
      { title: `${query}入门教程`, description: `从零开始学习${query}的基础知识` },
      { title: `${query}实用技巧`, description: `${query}开发中的实用技巧和经验分享` },
      { title: `${query}最佳实践`, description: `${query}领域的最佳实践和案例分析` },
      { title: `${query}进阶指南`, description: `深入探索${query}的高级特性和应用` },
    ];
  }
};

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // 尝试使用 OpenAI API
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个文章搜索助手。根据用户的查询，返回3-5篇相关文章的标题和简短描述。每篇文章格式为JSON对象：{title: string, description: string}。返回一个JSON数组。"
          },
          {
            role: "user",
            content: `请推荐关于"${query}"的文章`
          }
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      
      // 尝试解析 AI 返回的 JSON
      let articles = [];
      try {
        articles = JSON.parse(content || '[]');
      } catch (e) {
        console.error('Failed to parse AI response, using mock data');
        articles = getMockArticles(query);
      }

      return NextResponse.json({ articles, source: 'ai' });
    } catch (aiError: any) {
      // AI 调用失败，使用 mock 数据
      console.warn('OpenAI API failed, using mock data:', aiError.message);
      const articles = getMockArticles(query);
      return NextResponse.json({ articles, source: 'mock' });
    }
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search articles' },
      { status: 500 }
    );
  }
}
