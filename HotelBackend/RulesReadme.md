Backend Coding Standards
This document outlines the core coding standards and architectural rules for our backend services. Following these guidelines ensures code consistency, maintainability, and high performance.

1. Code Style & Naming Conventions
Readability: Write clean, well-formatted, and properly indented code. Use early returns to reduce nesting and improve clarity.

Namespaces: Use a semicolon after the namespace declaration instead of curly braces ({}) and namespace should not greater than 4 words.

Structure: Folder names must be plural (e.g., Controllers), and file names must be singular (e.g., UserController.cs).

API Routes: All API routes must be lowercase, readable, and consistent.

2. Architecture & Organization
Clean Architecture: Follow the established clean architecture structure.

Feature Folders: Place Commands and Queries directly within their respective feature folders. Do not create subfolders inside them.

Mappers: Use IMapFrom for simple DTOs and ICreateMapFrom for commands. Use separate AutoMapper classes for complex mappings.

File Handling:

use ICreateDocumentPath repsoitory.

3. Best Practices & Utilities
Validation: Use the ValidationManager for existence checks and enum validations.

Dependencies: Use existing repositories for common functionalities like token handling, file uploads, and payment gateways. Do not write new logic for these.

Entity Updates: Always call UpdateAsync on an entity to ensure the UpdatedDate is set correctly. Do not update entities directly.

Identity: Access the current user's UserId and OrganizationId via the IUserIdAndOrganizationIdRepository.

4. Performance & Security
Database Queries:

Avoid unnecessary Include and ThenInclude clauses.

Use AnyAsync instead of FirstOrDefaultAsync for existence checks.

Optimize all queries to avoid unnecessary loops.

Error Handling: Using NLog for logging. Do not use try-catch blocks.

Additional Important Rules:-
1. If you use imapfrom(for get dtos) and icreatemapfrom(for create dtos) there is no need to use make custom file and createmap like shit . you need custom file only when you have to do custom mappings like formember aur another and dont you custom mapping file for every table like we can you only one mapping file for all product related .
2.  Use AutoMapper for both create and get. 
3. in applicationdbcontext dont give space between per dbset
4. use your common sense on some places like if there is a properly named backgroud image (date type string) in entity we have to take iformfile and upload the document use icreatedocumentpath repositry for file upload
5. in controller dont do like this new GetProductTypeByIdQuery { Id = id };  first make construor and in _mediator.Send(new GetDocumentTypeByIdQuery) direclty
6. There should proper folder structure like in dtos first there will be product folder on that there we will product type folder on that there will be dto same in feature , controller and all places 
7. dont give space between properties in a dto or enitity give space on the top of data annotation like 
    public string Name { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

8. use only icreatedocumentpath for file upload
9. for deleting we can only pass id to unitofwork's delete method that will do all things like checking existence and all. 
10. in update command for dto use create command if can be used. best way is to create new property for id and one for create command and make a constructor
11. namespace must not long than 4 words
12. no unnessary code in the project
13. for these fields in a dto  inherit BaseDto
   public int Id { get; set; }
   public int? CreatedBy { get; set; }
   public DateTime? CreatedDate { get; set; }
   public DateTime? UpdatedDate { get; set; }
   public bool IsActive { get; set; }
14. in getallquery if page number and page size is sent 0 return complte data means no pagination
15. BadRoute [Route("api/producttype")]   good route [Route("api/product/type")]
16.  bad code :-   var data = await _mediator.Send(new GetProductTypeByIdQuery { Id = id });
     good code :-  var data = await _mediator.Send(new GetProductTypeByIdQuery(id));  // means create constructors  for getbyid, delete , update where needed
17. dont use a class like this Domain.Entities.Collections.CollectionProduct  direclty use CollectionProduct and namespace should in top
18. I Repositories like IOtpRepository should in Interfaces/Repositories/Otps/ not directly in repositories folder . follow proper folder structure