const templates = {
    user: {
        name: 'String',
        email: 'String',
        password: 'String',
        createdAt: 'Date'
    },
    blog: {
        title: 'String',
        content: 'String',
        author: 'String',
        tags: '[String]',
        published: 'Boolean'
    },
    product: {
        name: 'String',
        price: 'Number',
        inStock: 'Boolean',
        description: 'String'
    }
};

export default templates;
