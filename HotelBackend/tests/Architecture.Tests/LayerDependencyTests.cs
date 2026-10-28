using Domain.Entities.Guests;
using NetArchTest.Rules;

namespace Architecture.Tests;

public class LayerDependencyTests
{
    [Fact]
    public void Domain_does_not_reference_outer_layers()
    {
        var result = Types.InAssembly(typeof(Guest).Assembly)
            .Should()
            .NotHaveDependencyOnAny("Application", "Infrastructure", "Persistence", "WebApi")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Application_does_not_reference_infrastructure_or_api()
    {
        var referenced = typeof(Application.Features.Commons.ValidationManager).Assembly
            .GetReferencedAssemblies()
            .Select(assembly => assembly.Name)
            .ToHashSet();

        Assert.DoesNotContain("Infrastructure", referenced);
        Assert.DoesNotContain("Persistence", referenced);
        Assert.DoesNotContain("WebApi", referenced);
    }

    [Fact]
    public void Controllers_do_not_use_the_db_context()
    {
        var result = Types.InAssembly(typeof(WebApi.Program).Assembly)
            .That()
            .ResideInNamespaceMatching("WebApi.Controllers")
            .Should()
            .NotHaveDependencyOn("Persistence.DataContext")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }
}
