const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION_ID = 'thesis_samples';

async function addSample() {
    try {
        const result = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                title: "DESIGN AND IMPLEMENTATION OF WEB-BASED FINAL YEAR PROJECT FLOW MANAGEMENT SYSTEM",
                content: `<h2>ABSTRACT</h2>
<h3>The management of final year projects in many higher institutions is still largely dependent on 
manual and fragmented digital approaches such as paper-based documentation, emails, WhatsApp, 
Telegram, and virtual meeting platforms. These methods often result in poor supervision tracking, 
communication gaps, delayed approvals, weak accountability, loss of academic records, and 
increased administrative workload. This study therefore focused on the design and implementation 
of a Higher Institution Final Year Project Flow Management System aimed at improving the 
efficiency, transparency, and coordination of project supervision activities within higher 
institutions. 
The system was developed as a centralized web-based platform that enables students, supervisors, 
and administrators to effectively manage the entire final year project lifecycle. The proposed 
system provides functionalities such as proposal submission, supervisor assignment, chapter 
upload, project progress tracking, feedback management, file sharing, notifications, and 
centralized communication. The system was implemented using React.js with TypeScript for the 
frontend, Node.js with Express.js for backend services, and Appwrite for authentication, database 
management, and file storage. 
System analysis and design techniques including use case diagrams, data flow diagrams, database 
design models, and system architecture models were employed during the development process. 
The Agile software development methodology was adopted to support incremental system 
development, testing, and improvement. The developed system was evaluated using functional 
testing, integration testing, and user acceptance testing to ensure that the system satisfies both 
functional and non-functional requirements. 
The findings from the implementation and evaluation indicate that the system provides a more 
organized, secure, transparent, and efficient approach to final year project supervision when 
compared with existing manual and semi-digital methods. The study concludes that the adoption 
of a centralized web-based project flow management system can significantly enhance 
communication, supervision efficiency, academic record management, and workflow monitoring 
in higher institutions. </h3>
<h1>chapter 1</h1>
<p> Background of the Study 
The rapid advancement of information and communication technologies (ICT) has fundamentally 
transformed how organisations create, store, process, and disseminate information. In 
contemporary societies, information is regarded as a strategic resource whose effective 
management determines organisational efficiency, accountability, and sustainability. Higher 
institutions, as centres of knowledge creation and dissemination, are not exempt from this 
transformation. Universities globally are increasingly adopting information management systems 
to enhance academic administration, teaching, learning, and research processes. Within this 
context, the management of undergraduate final year projects, which represent a critical academic 
requirement for graduation, has become an important area requiring structured and technology
driven solutions. In Nigerian universities, including the University of Ibadan and other public and 
private higher institutions, the final year project constitutes a compulsory academic exercise 
designed to assess students’ ability to conduct independent research, apply theoretical knowledge 
to practical problems, and communicate findings effectively. Despite its importance, the processes 
surrounding project topic approval, supervision, progress monitoring, communication, 
documentation, and assessment are still largely managed using manual or fragmented semi-digital 
approaches. These include the use of paper files, email exchanges, WhatsApp or Telegram 
messages, and ad-hoc virtual meeting tools such as Zoom for supervision discussions. While these 
tools offer some level of convenience, they were not originally designed to manage the structured 
workflow of academic projects and therefore fall short of institutional standards for accountability, 
traceability, and data management. 
The outbreak of the COVID-19 pandemic further exposed the inadequacies of existing project 
management practices in higher institutions. As physical meetings became limited, supervisors and 
students increasingly relied on Zoom meetings, emails, and instant messaging platforms to 
coordinate project activities. Although Zoom effectively facilitated real-time virtual meetings, it 
does not provide mechanisms for proposal submission workflows, version control of project 
documents, supervision tracking, grading, or institutional-level analytics. Consequently, 
1 
universities faced challenges such as loss of project records, inconsistent supervision practices, 
delayed approvals, and difficulty in evaluating students’ progress objectively. These challenges 
have persisted even after the resumption of physical academic activities, underscoring the need for 
a more comprehensive and purpose-built system. Against this backdrop, this project focuses on 
the design and implementation of a web-based Final Year Project Flow Management System 
tailored to the operational realities of Nigerian higher institutions. The proposed system seeks to 
centralise and automate the entire project lifecycle from topic proposal and supervisor allocation 
to progress tracking, communication, documentation, and assessment thereby addressing the 
shortcomings of existing manual and semi-digital approaches. By leveraging modern web 
technologies and a structured workflow model, the system aims to enhance transparency, 
efficiency, and academic quality assurance in undergraduate project management.<b>Evolution of Information Management Systems in Higher Institutions</b>.
Information Management Systems (IMS) have evolved significantly over the past few decades, 
transitioning from rudimentary file-based systems to sophisticated, web-based platforms that 
support complex organisational processes. In higher institutions, early information management 
practices were largely manual, involving physical records stored in filing cabinets and managed 
by administrative staff. These systems were time-consuming, error-prone, and vulnerable to data 
loss through mishandling, fire, or deterioration (Laudon & Laudon, 2020). With the advent of 
computerisation in the late twentieth century, universities began to adopt standalone computer 
systems to manage student records, examination results, and staff information. However, these 
systems were often isolated, lacked interoperability, and required significant technical expertise to 
maintain. The emergence of the internet and web technologies in the early 2000s marked a turning 
point, enabling the development of integrated academic management systems that could be 
accessed remotely and updated in real time (Al-Shihi, Sharma, & Sarrab, 2018). 
In recent years, cloud computing, service-oriented architectures, and RESTful APIs have further 
reshaped information management in higher institutions. Modern IMS now support scalability, 
data security, and analytics, allowing institutions to make data-driven decisions. Learning 
Management Systems (LMS) such as Moodle and Canvas exemplify this evolution by providing 
platforms for course delivery, assessment, and communication. However, while LMS platforms 
address teaching and learning needs, they often lack specialised workflows required for managing 
2 
undergraduate research projects, particularly within the Nigerian academic context (Abubakar & 
Adebayo, 2021). The management of final year projects requires functionalities that go beyond 
content delivery. These include structured approval processes, supervisor–student matching, 
milestone tracking, document versioning, and performance evaluation. Existing generic systems 
and communication tools do not adequately support these requirements. As a result, there is a 
growing recognition among scholars and academic administrators that dedicated project flow 
management systems are necessary to complement existing institutional IMS (Kumar & Sharma, 
2019). This study aligns with this perspective by proposing a system specifically designed to 
manage the complexities of undergraduate final year projects.
<b>Final Year Project Processes in Nigerian Universities</b>.
In Nigerian universities, the final year project is a capstone academic requirement typically 
undertaken in the final year of an undergraduate programme. The process generally begins with 
the selection or proposal of a research topic by the student, followed by approval from a 
departmental project coordinator or committee. Once approved, a supervisor is assigned to guide 
the student through the research process, which may span one or two academic semesters 
depending on institutional regulations (National Universities Commission [NUC], 2022). 
The supervision process involves periodic meetings between the student and the supervisor to 
discuss research progress, challenges, and methodological issues. Traditionally, these meetings 
were conducted face-to-face, with supervisors manually reviewing printed drafts and providing 
handwritten comments. In recent years, especially during and after the COVID-19 pandemic, many 
of these interactions shifted to digital platforms such as Zoom, email, and instant messaging 
applications. While this shift improved accessibility, it also introduced inconsistencies in record 
keeping and supervision quality, as discussions and feedback were rarely documented in a 
structured, retrievable manner. 
Furthermore, the final year project process culminates in the submission of a bound or electronic 
report and, in some cases, an oral defence. Assessment is typically based on criteria such as 
originality, methodology, presentation, and supervisor’s evaluation. However, due to the 
fragmented nature of project management, departments often struggle to maintain comprehensive 
records of student progress, supervision frequency, and assessment justification. This situation 
poses challenges for quality assurance, accreditation exercises, and academic audits conducted by 
3 
regulatory bodies such as the NUC. The reliance on tools like Zoom for supervision meetings, 
although useful for communication, does not align with institutional requirements for systematic 
documentation and workflow control. Zoom sessions are ephemeral unless manually recorded, and 
even when recorded, they are not integrated with project documentation or assessment records. 
Consequently, Nigerian universities require a more holistic digital solution that integrates 
communication, documentation, supervision tracking, and evaluation within a single platform. 
<b>Need for a Centralized Web-Based Final Year Project Flow Management System .</b>
The challenges associated with manual and semi-digital project management underscore the urgent 
need for a centralized, web-based Final Year Project Flow Management System. Such a system 
would provide an integrated platform where all stakeholders students, supervisors, project 
coordinators, and administratorscan interact within a structured and transparent workflow. Unlike 
Zoom or email-based approaches, a dedicated system would embed academic rules and processes 
directly into its design, ensuring compliance with institutional standards. A centralized web-based 
system enables end-to-end management of the project lifecycle. Proposal submissions and 
approvals can be automated, supervisor allocations tracked, and milestones clearly defined. 
Communication between students and supervisors can be documented within the system, creating 
an auditable trail of guidance and feedback. This not only enhances accountability but also protects 
both parties in cases of disputes or academic reviews. Furthermore, built-in analytics can support 
evidence-based decision-making by providing insights into supervision patterns, project progress, 
and overall departmental performance (Mensah & Owusu, 2021). From a Nigerian higher 
education perspective, such a system aligns with national and global calls for digital transformation 
in education. Regulatory bodies increasingly emphasise the use of technology to improve quality 
assurance and data management. By replacing fragmented tools like Zoom, WhatsApp, and email 
with a unified platform, universities can standardise project management practices and improve 
academic outcomes. Therefore, the development of a web-based Final Year Project Flow 
Management System is not merely a technological upgrade but a strategic response to persistent 
academic and administrative challenges within Nigerian higher institutions.
<b>Statement of the Problem</b>
The management of undergraduate final year projects in many Nigerian higher institutions is 
plagued by several academic and administrative challenges arising from manual and poorly 
integrated digital practices. These problems are outlined as follows: 
<strong>Unstructured and inefficient project administration  </strong>
o Final year projects, despite their importance in assessing students’ research competence, 
are still managed through informal and fragmented processes.  
5 
o There is no standardized system governing proposal submission, approval, 
supervision, and assessment. 
<strong>Delays in project approval and completion timelines  </strong>
 Project proposals are often submitted physically or via emails and messaging 
platforms.  
o The absence of a clearly defined workflow results in misplaced documents, 
overlooked messages, and prolonged feedback cycles.  
o These delays negatively affect project execution schedules and may extend 
students’ graduation timelines. 
<strong>Poor supervision tracking and lack of accountability   </strong>
There is no formal system for documenting or monitoring supervisor–student 
interactions.  
o Meetings conducted physically or through platforms such as Zoom are rarely 
recorded in a structured format.  
o Departments lack visibility into supervision frequency, quality, and workload 
distribution, making timely intervention difficult. 

<h2> Aim and Objectives of the Study </h2>
The aim of this study is to design and implement a web-based Final Year Project Flow Management 
System that centralizes and automates the management of undergraduate final year projects in 
Nigerian higher institutions.  
To achieve this aim, the study is guided by the following specific objectives: 
1. To create a dashboard that enables students to submit proposals, presentations, other project 
documents and track their progres 
2. To create a dashboard for supervisors to review, comment on, and manage project 
documents 
3. To develop a real-time communication and file-sharing platform 
4. To centralize project documentation and version control 
Through the achievement of these objectives, the study seeks to modernize the management of 
final year projects, improve supervision efficiency, enhance student accountability, and facilitate 
institutional decision-making. The integration of dashboards and real-time communication 
platforms distinguishes this system from existing approaches that rely heavily on fragmented tools 
like Zoom, email, or messaging apps, which fail to provide structured workflow control, document 
versioning, or analytics. 
<b> Significance of the Study </b>
This study is significant because it provides a centralized web-based solution for managing final 
year projects in Nigerian higher institutions, thereby addressing the inefficiencies associated with 
manual and fragmented communication methods such as WhatsApp, email, and paper-based 
processes. The system benefits students by enabling easy proposal submission, progress tracking, 
document management, and timely feedback from supervisors, which improves accountability and 
research productivity. Supervisors also benefit through a dedicated platform for monitoring student 
progress, reviewing submissions, and maintaining organized supervision records, thereby reducing 
8 
miscommunication and missed deadlines. For institutions, the system enhances administrative 
efficiency, supports academic quality assurance, and provides data-driven insights for decision
making, accreditation, and performance evaluation. Furthermore, the study contributes to 
academic and technological development by serving as a reference model for researchers and 
developers interested in educational workflow management systems, while also creating 
opportunities for future improvements such as AI-based monitoring and Learning Management 
System integration. 
<b> Scope of the Study </b>
This study focuses on the design, development, and implementation of a web-based Final Year 
Project Flow Management System for Nigerian higher institutions. The system is intended to 
support students, supervisors, and departmental administrators involved in managing final year 
projects. Its functionalities include project proposal submission, progress tracking, supervision 
monitoring, document management, real-time communication, and analytical reporting. The study 
will be implemented and evaluated within selected Nigerian universities to ensure relevance to 
local academic practices and requirements. Technologically, the system will utilize modern web 
technologies such as React.js and TypeScript for the frontend, Node.js with Express.js for the 
backend, and Appwrite for database management and authentication, with deployment on Render 
for accessibility across desktop and mobile devices. The study is limited to undergraduate final 
year projects and focuses on workflow management, supervision, communication, and 
documentation processes, excluding postgraduate projects and the specific research content or 
methodologies of individual studies. </p>`,
                category: 'Computer Science',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        );
        console.log("Successfully created thesis sample:", result.$id);
    } catch (e) {
        console.error("Error creating document:", e.message);
    }
}

addSample();
