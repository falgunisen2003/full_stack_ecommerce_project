from rest_framework.decorators import api_view, permission_classes # type: ignore[import]
from rest_framework.permissions import IsAuthenticated, AllowAny # type: ignore[import]
from rest_framework.response import Response # type: ignore[import]
from rest_framework import status # type: ignore[import]
from django.shortcuts import get_object_or_404 # type: ignore[import]
from .models import Product, CartItem, Category, Cart, Order, OrderItem
from .serializers import CartItemSerializer, ProductSerializer, CategorySerializer, CartSerializer, RegisterSerializer, UserSerializer

# --- PRODUCT & CATEGORY ENDPOINTS (PUBLIC) ---

@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product(request, id):
    product = get_object_or_404(Product, id=id)
    serializer = ProductSerializer(product)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# --- AUTH ENDPOINTS ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response({
            "message": "User Created Successfully",
            "user": user_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- CART ENDPOINTS (AUTHENTICATED) ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    # Fetch or create the cart linked directly to the logged-in user
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    product = get_object_or_404(Product, id=product_id)
    
    cart, created = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not created:
        item.quantity += 1
        item.save()
        
    serializer = CartSerializer(cart)
    return Response({'message': 'Product added to cart', 'cart': serializer.data}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')

    if not item_id or quantity is None:
        return Response(
            {'error': 'Item ID and quantity are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Secure it by making sure the cart item belongs to the user's cart
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
        
        if int(quantity) < 1:
            item.delete()
            return Response(
                {'error': 'Quantity must be at least 1'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        item.quantity = quantity
        item.save()
        
        serializer = CartItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except CartItem.DoesNotExist:
        return Response(
            {'error': 'Cart item not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    # Filter by user cart to prevent removing other people's items
    CartItem.objects.filter(id=item_id, cart__user=request.user).delete()
    return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    CartItem.objects.filter(cart__user=request.user).delete()
    return Response({'message': 'Cart completely cleared'}, status=status.HTTP_200_OK)


# --- ORDER ENDPOINTS (AUTHENTICATED) ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        name = data.get('name')
        address = data.get('address')
        phone = data.get('phone')
        payment_method = data.get('payment_method', 'COD')

        # Find the specific user's cart instead of using .first()
        cart = Cart.objects.filter(user=request.user).first()

        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Basic phone validation script from your video setup
        if phone:
            clean_phone = str(phone).strip()
            if not clean_phone.isdigit() or len(clean_phone) < 10:
                return Response({'error': 'Invalid phone number'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(float(item.product.price) * item.quantity for item in cart.items.all())

        # Create Order tied to the requesting user
        order = Order.objects.create(
            user=request.user,
            total_amount=total,
        )

        # Create Order Items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )
        
        # Clear database cart items safely for this user's cart
        cart.items.all().delete()

        return Response({
            "message": "Order Placed Successfully",
            "order_id": order.pk,
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)