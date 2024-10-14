echo 'running tester.sh ...'

current_pwd=$(pwd)

if ! deno task validate_args "$@"; then 
  echo 'error running `deno task validate_args`, exiting early'
  return
fi

if ! deno task init_kv; then
  echo 'error running `deno task init_kv`, exiting early'
  return
fi

# TODO: always init stack, or only when cd is valid?
if ! deno task init_stack --pwd="$current_pwd"; then
  echo 'error running `deno task init_stack`, exiting early'
  return
fi

case "$1" in 
  --forwards)
    ;;
  --backwards)
    ;;
  --changeDir)
    if cd "$2"; then 
      deno task push_stack --pwd="$current_pwd" "$2"
    fi
    ;;
esac


# deno task cleanup
echo 'after running'
