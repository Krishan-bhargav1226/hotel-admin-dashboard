namespace Application.Dto.CommonDtos
{
    public class IdAndNameDto:IdAndNameDto<int>
    {
    }
    
    public class IdAndNameDto<T>
    {
        public T? Id { get; set; }
        public string? Name { get; set; }
    }
}
