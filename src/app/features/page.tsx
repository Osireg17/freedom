// src/app/features/page.tsx

const FeaturesPage = () => {
    return (
        <div className="container py-12 md:py-16">
            <h1 className="text-3xl font-bold mb-6" data-testid="features-page-heading">
                Features
            </h1>
            <p data-testid="features-page-description">
                This page will list all the features of AceYourHireVue in detail.
            </p>
        </div>
    );
};

export default FeaturesPage;
