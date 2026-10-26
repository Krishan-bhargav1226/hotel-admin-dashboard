using Application.Extensions.LinqExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Application.Extensions.LinqExtension;

public static class IncludeIgnoreExtensions
{
    public static IQueryable<T> ThenIgnore<T, TProperty>(this IQueryable<T> source, Expression<Func<T, TProperty>> property)
    {
        NavigationIgnoreManager.RegisterIgnore(property);
        return source;
    }

    public static IIncludableQueryable<T, TProperty> ThenIgnore<T, TProperty>(
    this IIncludableQueryable<T, TProperty> source,
    Expression<Func<TProperty, object>> propertyToIgnore)
    {
        NavigationIgnoreManager.RegisterIgnore(propertyToIgnore);
        return source;
    }

    public static async Task<T?> FirstOrDefaultAndApplyIgnoresRecursiveAsync<T>(this IQueryable<T> query) where T : class
    {
        var entity = await query.FirstOrDefaultAsync();
        if (entity != null)
        {
            ApplyIgnoresRecursive(entity, new HashSet<object>());
        }
        return entity;
    }

    public static async Task<List<T>> ToListAndApplyIgnoresRecursiveAsync<T>(this IQueryable<T> query) where T : class
    {
        var list = await query.ToListAsync();
        foreach (var item in list)
        {
            ApplyIgnoresRecursive(item, new HashSet<object>());
        }
        return list;
    }

    private static void ApplyIgnoresRecursive(object? obj, HashSet<object> visited)
    {
        if (obj == null || visited.Contains(obj)) return;

        visited.Add(obj);

        var type = obj.GetType();
        var ignores = NavigationIgnoreManager.GetIgnores(type);

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanRead || !prop.CanWrite) continue;

            var value = prop.GetValue(obj);

            // Nullify ignored properties
            if (ignores.Contains(prop.Name))
            {
                prop.SetValue(obj, null);
                continue;
            }

            if (value == null) continue;

            if (value is IEnumerable<object> enumerable && prop.PropertyType != typeof(string))
            {
                foreach (var item in enumerable)
                    ApplyIgnoresRecursive(item, visited);
            }
            else
            {
                ApplyIgnoresRecursive(value, visited);
            }
        }
    }
}
