# Issues Tracker

## Overview
This directory contains detailed documentation of all known issues in the Kaha Hostel Control Center project.

## Current Issues

### High Priority Issues
- ✅ **[PAYMENT_API_500_ERROR.md](./PAYMENT_API_500_ERROR.md)** - Frontend syntax errors fixed, payment API needs backend investigation
- ✅ **[COMPREHENSIVE_FIXES.md](./COMPREHENSIVE_FIXES.md)** - Multiple UI/UX issues resolved

### Medium Priority Issues
- None currently

### Low Priority Issues
- None currently

## Issue Status Legend
- 🔴 **High Priority** - Blocking functionality, needs immediate attention
- 🟡 **Medium Priority** - Important but has workarounds
- 🟢 **Low Priority** - Minor issues, can be addressed later
- ✅ **Resolved** - Issue has been fixed
- 🔄 **In Progress** - Currently being worked on

## Issue Template

When creating new issue documentation, use this template:

```markdown
# Issue Title

## Issue Description
Brief description of the issue

## Error Details
- **Status Code**: 
- **Message**: 
- **Endpoint**: 
- **Date Discovered**: 

## Investigation Steps Taken
List of steps taken to investigate

## Potential Root Causes
Possible causes of the issue

## Recommended Solutions
Suggested fixes

## Impact
- **Severity**: 
- **Affected Feature**: 
- **User Impact**: 
- **Workaround**: 

## Status
- **Current Status**: 
- **Priority**: 
- **Assigned To**: 
- **Created**: 
- **Last Updated**: 
```

## Contributing

1. Create detailed issue documentation using the template above
2. Update this README with the new issue
3. Assign appropriate priority level
4. Link related files and code sections

## Resolution Process

1. **Investigation**: Document all investigation steps
2. **Root Cause Analysis**: Identify the actual cause
3. **Solution Implementation**: Apply the fix
4. **Testing**: Verify the fix works
5. **Documentation Update**: Mark as resolved and document the solution
6. **Archive**: Move resolved issues to a resolved/ subdirectory

## Related Documentation
- [API Integration Docs](../docs/api-integration/)
- [Troubleshooting Guides](../docs/troubleshooting/)
- [Project Tasks](../.kiro/specs/api-integration/tasks.md)




how the recent activities were configured in the backend it that working properly 
what what are actions if done that is going to store on recent activies and what are thoose actions e.g booking

here what is Collection Rate and Avg Occupancy  --> how they works, how they calculated is both are correct?


Student Status Distribution->real from api or fake?

also hteres

Performance Metrics
Average Stay Duration
180 days
Payment Collection Rate
67%
Total Invoices
3
Paid Invoices
2

all are form the api or if yes what is the logic?


if you look at the dashboard of ladger 
overview and analutics


when this Students with Overdue Payments (0)  will change  
is that valid discount id
DSC1756643907540
DSC1756636493190001
why this student ladger is not updateing the




## Recently Fixed Issues ✅

### UI/UX Fixes Completed
- ✅ **Number concatenation issue fixed** - NPR 8000.002000.008000.00 now displays correctly
- ✅ **Checkout button hidden for checked out students** - No more checkout option after checkout
- ✅ **Amenities section added to room creation** - Users can now select amenities when creating rooms
- ✅ **Student ledger filtering** - Only configured students appear in ledger view
- ✅ **TypeScript compilation errors resolved** - Application builds successfully

### Outstanding Questions for Backend Team

#### Dashboard Analytics
- How are recent activities configured in the backend? What actions trigger recent activity entries?
- Collection Rate and Avg Occupancy calculations - are these correct?
- Student Status Distribution - is this real API data or mock data?
- Performance Metrics (Average Stay Duration: 180 days, Payment Collection Rate: 67%) - what's the calculation logic?

#### Data Integrity Issues
- Students with Overdue Payments shows (0) - when will this update?
- Are these valid discount IDs: DSC1756643907540, DSC1756636493190001?
- Why is student ledger not updating properly?
- How is occupancy rate calculated?
- Students with Outstanding Dues not changing after payment recording - ledger should update

#### Workflow Questions
- When should room assignment happen in the student management workflow?
- What's the proper sequence: Student Creation → Configuration → Room Assignment → Billing?

See [COMPREHENSIVE_FIXES.md](./COMPREHENSIVE_FIXES.md) for detailed technical fixes appli 
