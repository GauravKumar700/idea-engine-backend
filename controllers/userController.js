const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const users = await User.findOne({ email }).select("+password");

        if (users) {
            return next(new ErrorHandler("User is already exist please login", 401));
        }

        const user = await User.create({
            name: name,
            email: email,
            password: password,
        });
        sendToken(user, 201, res);
    } catch (error) {
        return next(new ErrorHandler("Failed to Sign up"))
    }
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    // const { body } = req
    const { email, password } = req.body;
    // Checking if user has given password and email both
    try {
        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }
        sendToken(user, 200, res);
    } catch (error) {
        return next(new ErrorHandler("Not Authorized"))
    }
});


// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Logged Out",
        });
    } catch (error) {
        return next(new ErrorHandler("Logout Failed"))
    }
});

const genAI = new GoogleGenerativeAI("AIzaSyAM1T6li4pgjil1q55wbC_UvYq-cbNJs2I");
const answer = async (question) => {
    try {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = question
        const result = await model.generateContent(prompt);
        // const response = await result.response;
        const res = result.response;
        const text = res.text();
        // console.log(text);
        return text
    } catch (error) {
        window.alert(error)
    }
}

const generatePrompt = async (questions, answers) => {
    try {
        let buisnessName = answers[questions.indexOf('business name')]
        let buisnessStage = answers[questions.indexOf('business stage')]
        let buisnessDescription = answers[questions.indexOf('business description')]
        let numberOfEmployees = answers[questions.indexOf('Number of employees')]
        let buisnessOffers = answers[questions.indexOf('Do you offer a product or service?')]
        let customerGetMode = answers[questions.indexOf('How can customer get your product or service?')]
        let regionOfService = answers[questions.indexOf('Where do you serve your customers?')]
        let productServiceName = answers[questions.indexOf('Product or Service Name')]
        let productServiceDescription = answers[questions.indexOf('Product or Service Description')]
        let intialInvestment = answers[questions.indexOf('Total Initial Investment')]
        let firstYearRevenue = answers[questions.indexOf('Expected First Year Revenue')]
        let rateOfGrowthPerYear = answers[questions.indexOf('How much do you expect your revenue to grow each year?')]
        let yearlyBuisnessOperatingCost = answers[questions.indexOf('Yearly Business Operations Cost')]

        let prompt = `Create an end to end business plan as well as guidance plan that helps me create a business by the name of ${buisnessName}.It is in the stage of ${buisnessStage}.${buisnessName} is suppose to be ${buisnessDescription}.At this stage our comapny contains ${numberOfEmployees} number of employees. ${buisnessName} offers ${buisnessOffers}. A customer gets my ${buisnessOffers} from ${customerGetMode} mode. We Serve our customers in ${regionOfService}. Our ${buisnessOffers} name is ${productServiceName}. ${productServiceName} is suppose to be ${productServiceDescription}. Our Intial investment is ${intialInvestment}.Our expected first year revenue is ${firstYearRevenue} And i want to grow my revenue at the rate of ${rateOfGrowthPerYear} Our buisness yearly operating buisness cost is ${yearlyBuisnessOperatingCost}.`

        return prompt
    } catch (error) {
        window.alert(error)
    }
}

// Creating PDF
exports.createPdf = catchAsyncErrors(async (req, res, next) => {
    try {
        const { messages, domain } = req.body;
        const questions = messages.questions
        const answers = messages.answers
        let prompt = await generatePrompt(questions,answers);
        const text = await answer(prompt)

        // Create a PDF document
        const doc = new PDFDocument();
        const fileName = 'output.pdf';
        // Set content disposition to force the browser to download the file
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        // Pipe the PDF content to the response
        doc.pipe(res);
        doc.fontSize(21).text("Blueprint According to your Response").moveDown()
        doc.fontSize(12).text(text).moveDown()

        doc.fontSize(21).text("Executive Summary").moveDown()
        let executiveSummay = await answer(`${prompt} + \nPlease explain in more detail about the Executive summary statement`);
        const executiveText = await answer(executiveSummay)
        doc.fontSize(12).text(executiveText).moveDown()

        doc.fontSize(21).text("Marketing Analysis").moveDown()
        let marketAnalysis = await answer(`${prompt} + \nPlease explain in more detail about the Market Analysis statement`);
        const marketText = await answer(marketAnalysis)
        doc.fontSize(12).text(marketText).moveDown()

        doc.fontSize(21)
        doc.text("Product Description")
        doc.moveDown()
        doc.fontSize(12)
        let productDescription = await answer(`${prompt} + \nPlease explain in more detail about the Product Description statement`);
        const productText = await answer(productDescription)
        doc.text(productText)
        doc.moveDown()

        doc.fontSize(21)
        doc.text("Business Model")
        doc.moveDown()
        doc.fontSize(12)
        let businessModel = await answer(`${prompt} + \nPlease explain in more detail about the Business Model statement`);
        const buisnessText = await answer(businessModel)
        doc.text(buisnessText)
        doc.moveDown()

        doc.fontSize(21)
        doc.text("Financial Plan")
        doc.moveDown()
        doc.fontSize(12)
        let financialPlan = await answer(`${prompt} + \nPlease explain in more detail about the Financial Plan statement`);
        const financialText = await answer(financialPlan)
        doc.text(financialText)
        doc.moveDown()

        doc.fontSize(21)
        doc.text("Marketing and Sales Strategy")
        doc.moveDown()
        doc.fontSize(12)
        let marketingStrategy = await answer(`${prompt} + \nPlease explain in more detail about the Marketing and Sales Strategy statement`);
        const marketingText = await answer(marketingStrategy)
        doc.text(marketingText)
        doc.moveDown()

        doc.fontSize(21)
        doc.text("Guidance Plan")
        doc.moveDown()
        doc.fontSize(12)
        let guidancePlan = await answer(`${prompt} + \nPlease explain in more detail about the Guidance Plan statement`);
        const guidanceText = await answer(guidancePlan)
        doc.text(guidanceText)
        doc.moveDown()

        doc.fontSize(21)
        doc.text("Mission Statement")
        doc.moveDown()
        doc.fontSize(12)
        let missionStatement = await answer(`${prompt} + \nPlease explain in more detail about the Mission Statement statement`);
        const missionText = await answer(missionStatement)
        doc.text(missionText)
        doc.moveDown()

        doc.fontSize(21)
        doc.text("Vision Statement")
        doc.moveDown()
        doc.fontSize(12)
        let visionStatement = await answer(`${prompt} + \nPlease explain in more detail about the Vision Statement statement`);
        const visionText = await answer(visionStatement)
        doc.text(visionText)
        doc.moveDown()

        let { technology } = domain
        doc.fontSize(21)
        doc.text("Process for Technology and Innovation")
        doc.moveDown()
        let technologyPrompt = `Our buisness offers ${technology['What awesome stuff will your business offer?']}. we have ${technology['How do you figure out what to make and how to make it?']} to figure out what to make and how to make it. We are looking for ${technology['How much do you expect to make, and how much will it cost to get started?']}. ${technology['What could go wrong with your business, and how will you handle it?']} is a threat for my buisness. We tell people about our awesome products through ${technology['How will you tell people about your awesome products?']}. Our Customers get product or service through ${technology['How can customers get your product or service?']}.  My buisness goal is ${technology['What goals are you aiming for, and how will you track your progress?']}`
        // My Plan for bringing in cash by ${ technology["What's your plan for bringing in cash ?"] }.
        let technologyText = await answer(technologyPrompt)
        doc.fontSize(12)
        doc.text(visionText)
        doc.moveDown()

        let { digital } = domain
        doc.fontSize(21)
        doc.text("Process for Digital Marketing").moveDown()
        let digitalPrompt = `We are targeting ${digital['types of clients']} clients for our digital marketing services. We want to offer ${digital['specific services you will offer']} services in social media marketing(YouTube, Facebook, Instagram) and performance marketing (Ads), including campaign creation, optimization, and analytics. We plan to integrate social media marketing efforts ${digital['plan to integrate social media marketing efforts']} across YouTube, Facebook, and Instagram with performance marketing campaigns to create cohesive and impactful digital marketing strategies for our clients. ${digital['strategies will you employ to effectively target and engage audiences']} strategies we will employ to effectively target and engage audiences on each social media platform (YouTube, Facebook, Instagram) and through performance marketing ads, ensuring maximum reach and conversion potential. We will allocate budgets between social media marketing efforts and performance marketing ad campaigns, considering factors such as platform costs, ad bidding strategies, and client goals ${digital['How will you allocate budgets between social media marketing efforts and performance marketing ad campaigns, considering factors such as platform costs, ad bidding strategies, and client goals?']}. ${digital["What metrics and analytics will you use to measure the success of your social media marketing efforts on YouTube, Facebook, and Instagram, as well as the performance of your ad campaigns, and how will you report these insights to"]} metrics and analytics we will use to measure the success of our social media marketing efforts on YouTube, Facebook, and Instagram, as well as the performance of our ad campaigns. ${digital['How do you plan to develop compelling ad creatives and messaging that resonate with target audiences across social media platforms (YouTube, Facebook, Instagram) and performance marketing campaigns, driving engagement and conversions?']} plan to develop compelling ad creatives and messaging that resonate with target audiences across social media platforms (YouTube, Facebook, Instagram) and performance marketing campaigns, driving engagement and conversions.`
        let digitalText = await answer(digitalPrompt)
        doc.fontSize(12)
        doc.text(digitalText)
        doc.moveDown()

        let { influencer } = domain
        doc.fontSize(21).text("Process for Influencer Marketing").moveDown()
        let influencerPrompt = `${influencer['What sets your influencer marketing business apart from competitors?']} sets my influencer marketing business apart from competitors. ${influencer['How do you plan to establish and communicate your brand identity to resonate with your target audience?']} is my plan to establish and communicate my brand identity to resonate with my target audience. ${influencer['What strategies will you use to build relationships with influencers in your chosen niche?']} strategies we will use to build relationships with influencers in our chosen niche. By ${influencer['How will you tailor your service packages to meet the unique needs and objectives of your clients?']} we will tailor our service packages to meet the unique needs and objectives of our clients. ${influencer['What methods will you use to reach out to brands and pitch your services effectively?']} methods will use to reach out to brands and pitch our services effectively. ${influencer["How do you plan to coordinate with influencers to create engaging content that aligns with brands' objectives?"]} is my plan to coordinate with influencers to create engaging content that aligns with brands objectives. ${influencer['What metrics will you use to monitor campaign performance and track ROI for your clients?']} metrics will use to monitor campaign performance and track ROI for our clients. By ${influencer['How will you stay updated on industry trends, platform algorithms, and best practices in influencer marketing?']} we will stay updated on industry trends, platform algorithms, and best practices in influencer marketing. ${influencer['What strategies do you have in place to adapt and evolve your business as the influencer marketing landscape changes?']} strategies we have in place to adapt and evolve your business as the influencer marketing landscape changes. ${influencer['What strategies will you implement to stay ahead of emerging trends and innovations in influencer marketing?']} strategies we will implement to stay ahead of emerging trends and innovations in influencer marketing.`
        let influencerText = await answer(influencerPrompt)
        doc.fontSize(12).text(influencerText).moveDown()

        let { content } = domain
        doc.fontSize(21)
        doc.text("Process for Content Production").moveDown()
        let contentPrompt = `${content['What kinds of stuff are we making, and why do people want it?']} we are making. we are making it for ${content['Who are we making it for, and what do they like?']}. By ${content["How do we make sure our stuff is better than everyone else's?"]} we are making sure our stuff is better than everyone else's. We need ${content["What do we need to make our stuff, and who's doing what?"]} to make our stuff. we are using ${content['What tools are we using to make sure our stuff looks good?']} to make sure our stuff looks good. By ${content['How do we ensure the quality and consistency of our content?']} we ensure the quality and consistency of our content. By ${content["How do we know if our stuff is doing well, and what do we do if it's not?"]} we know if our stuff is doing well, and what do we do if it's not. We are starting ${content['When are we starting, and what do we want to achieve?']}. By ${content["How do we know if we're doing a good job, and what's the plan for the future?"]} we know if we're doing a good job. ${content['What are the success evaluation metrics over time?']} are the success evaluation metrics over time.`
        let contentText = await answer(contentPrompt)
        doc.fontSize(12)
        doc.text(contentText)
        doc.moveDown()

        let { publicRelation } = domain
        doc.fontSize(21)
        doc.text("Process for Public Relation").moveDown()
        let publicRelationPrompt = `${publicRelation['What are the big trends in PR we can take advantage of?']} is the big trends in PR we can take advantage of. ${publicRelation['Who else is in the PR game, and how are we going to be different?']} is in the PR game, and how are we going to be different. we are doing ${publicRelation['What exactly are we doing for our clients, and why does it matter?']} for our clients, and why does it matter. we are going to focus on ${publicRelation['Are we going to focus on anything specific, and why?']}. we are trying to help ${publicRelation['Who are we trying to help, and what do they need?']} and what do they need. By ${publicRelation['How do we make sure they stick with us?']} we make sure they stick with us. By ${publicRelation['How are we getting the word out about our PR agency?']} we are getting the word out about our PR agency. We are doing ${publicRelation['What do we do to turn interested people into clients']} to turn interested people into clients. ${publicRelation['What might go wrong, and how do we fix it?']} might go wrong, and how do we fix it. ${publicRelation['What are the anticipated risks, and what are our mitigation plans?']} are the anticipated risks, and how to overcome this.`
        let publicRelationText = await answer(publicRelationPrompt)
        doc.fontSize(12)
        doc.text(publicRelationText)
        doc.moveDown()

        let { branding } = domain
        doc.fontSize(21)
        doc.text("Process for Branding and Designing").moveDown()
        let brandingPrompt = `${branding['What tech trends can we use to our advantage?']} tech trends can we use to our advantage. By ${branding['How do we plan to adapt to changing tech needs?']} we are  planning to adapt to changing tech needs. ${branding['What cool stuff are we offering?']} cool stuff are we offering. By ${branding["How do we make sure we're different from everyone else?"]} we make sure we're different from everyone else. ${branding['Who are our main customers?']} are our main customers. By ${branding['How do we make sure our stuff fits what they want?']} we make sure our stuff fits what customers want. By ${branding['How do we ensure our branding and design solutions remain fresh and relevant over time?']} we ensure our branding and design solutions remain fresh and relevant over time. ${branding['What are the success drivers for your products or services?']} are the success drivers for our products or services. ${branding['What new things are we planning?']} new things are we planning. By ${branding["How do we make sure everyone's always thinking of cool new stuff?"]} we make sure everyone's always thinking of cool new stuff.`
        let brandingText = await answer(brandingPrompt)
        doc.fontSize(12)
        doc.text(brandingText)
        doc.moveDown()

        // Finalize the PDF
        doc.end();
    } catch (error) {
        // Handle errors
        console.error(error);
        return next(error);
    }
});
