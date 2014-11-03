#ifndef VIRGIL_RUNTIME_VIRGIL_CPP
#define VIRGIL_RUNTIME_VIRGIL_CPP

#include <vector>
#include <functional>

namespace virgil
{
  class Pool
  {
    public:
      Pool() {}
      ~Pool()
      {
        flush();
      }

      // Disable copying, moving
      Pool(Pool const&) = delete;
      Pool& operator=(Pool const&) = delete;
      Pool(Pool&&) = delete;
      Pool& operator=(Pool&&) = delete;

      // Add reference
      template <typename T>
      void add(T* ptr)
      {
        deleters.push_back([=]() { delete ptr; });
      }

      // Flush the pool
      void flush()
      {
        for (auto deleter : deleters)
        {
          deleter();
        }
        deleters.erase(deleters.begin());
      }

    private:
      std::vector<std::function<void()>> deleters;
  };

  // Current allocation pool
  Pool* curPool = new Pool();
}

// Creates an object in a pool
void* operator new(size_t bytes, virgil::Pool* pool)
{
  if (bytes == 0)
    bytes = 1;

  // Attempt regular new
  void* ptr = ::operator new(bytes);

  // For unsuccessful allocations, call the new handler if set,
  // otherwise raise an exception.
  if (ptr == nullptr)
  {
    std::new_handler handler = std::set_new_handler(0);
    std::set_new_handler(handler);
    if (handler != nullptr)
      (*handler)();
    else
      throw std::bad_alloc();
  }

  return ptr;
}


#endif
