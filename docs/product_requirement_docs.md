# EGAB Product Requirements Document

## Overview
EGAB is a monorepo-based application ecosystem built with modern web technologies. It contains multiple applications and shared packages that form a cohesive platform. The applications are not meant to be used in production. Everything in this is meant to be used as a sandboxing environment for production-like prototypes so that stakeholders can review and comment on functionality before developers can build the functionality externally. Therefore, security protocols for logging in aren't required.

## Problem Statement
Modern web applications often struggle with inconsistent UI/UX, code duplication across projects, and maintenance overhead. EGAB solves these problems by:
- Centralizing shared UI components and design systems
- Establishing consistent developer experience across applications
- Enabling rapid development of new features and applications
- Creating scalable and maintainable architecture

## Core Requirements

### 1. Application Structure
- Maintain a monorepo architecture with clear separation of concerns
- Support multiple applications under a unified development experience
- Provide shared packages for UI components, design systems, and configuration

### 2. Technical Requirements
- Build on Next.js for optimal performance and developer experience
- Implement Tailwind CSS for consistent styling
- Use TypeScript for type safety and better developer experience
- Utilize Turbo for efficient build processes and dependency management

### 3. User Experience Requirements
- Consistent UI across all applications
- Responsive design for all screen sizes
- Accessible components that follow WCAG guidelines
- Fast loading times and optimal performance

### 4. Developer Experience Requirements
- Clear documentation and component usage examples
- Streamlined onboarding process for new developers
- Consistent code style and patterns
- Efficient development workflow with hot reloading

## Applications

There are 2 main applications for now. Greenheart and Educatius. They are used for helping Sending Organisations recruit and help participants travel to international locations to study and work (as interns or for a work and travel program). Educatius is the sending organization platform, and Greenheart is one of the receiving o.rganizations. There is a plan to add more receiving organizations in the future. In the descriptions students and participants are used exchangably. 

### Greenheart
Receiving Organization platform. Here are a few of the areas it covers:
- Recruiting Local Coordinators (Applications for users to become Local Coordinators)
- Recruiting Host Families (Applications for Host Families recruited by Local Coordinators)
- Matching Students with Host Families (Local Coordinators view students looking for a placement, find an appropriate host family, present the student to families, a host family expresses interest in hosting the student, the local coordinator then 'places a hold' on the student till they can upload relevant documentation, then submits the placement application to Greenheart admins for approval)
- Approval and Feedback processes. There can be multiple levels of feedback and approvals before applicartions and placements are approved.
- Monitoring of Students and Host Families. The Local Coordinators need to check in on students, host families, and conduct in home visits for prospective Host Families. They also manage any problems a host family is facing with students, and vice versa.
- Greenheart users have an overview of the Local Coordinators and Host Families and students. Regional Directors will approve placements and oversee any monitoring issues for Local Coordinators in their purview. Greenheart Admin users will make the final call on placements.
- SEVIS workflows. Greenheart admins with sufficient privelages are in charge of batching student applications for SEVIS.

### Educatius
Sending Organization platform. Here are a few of the areas it covers:
- Managing student leads
- Starting the student application to be sent to the receiving organization.
- Reviewing student applications and sending feedback
- Reviewing feedback sent by the Receiving Organization to make changes to the student application
- Upselling the student with add on packages
- Monitoring the students' progress when they have reached their destination and while they finish their program

### Web
A page to show the dirrerent UI components used across the other apps.

## Shared Resources

### UI Package
Comprehensive set of reusable UI components built with modern web standards. ShadcnUI is the component library of choice.

### Design System
Consistent design language and tokens for use across all applications.

## Success Metrics
- Developer adoption and satisfaction
- Code reuse percentage across applications
- Build time efficiency
- User satisfaction with consistent interfaces
- Reduced time-to-market for new features
