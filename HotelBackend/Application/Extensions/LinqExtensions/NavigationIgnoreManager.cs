using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Application.Extensions.LinqExtensions
{
    public static class NavigationIgnoreManager
    {
        private static readonly Dictionary<Type, List<string>> _ignores = new();

        public static void RegisterIgnore<T, TProperty>(Expression<Func<T, TProperty>> expression)
        {
            var propertyName = GetPropertyName(expression);
            var type = typeof(T);

            if (!_ignores.ContainsKey(type))
                _ignores[type] = new List<string>();

            if (!_ignores[type].Contains(propertyName))
                _ignores[type].Add(propertyName);
        }

        public static List<string> GetIgnores(Type type)
        {
            return _ignores.ContainsKey(type) ? _ignores[type] : new List<string>();
        }

        private static string GetPropertyName<T, TProperty>(Expression<Func<T, TProperty>> expression)
        {
            if (expression.Body is MemberExpression member)
                return member.Member.Name;

            if (expression.Body is UnaryExpression unary && unary.Operand is MemberExpression member2)
                return member2.Member.Name;

            throw new InvalidOperationException("Invalid expression.");
        }
    }

}
